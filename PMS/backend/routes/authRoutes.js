const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/student');
const { verifyToken, JWT_SECRET } = require('../middleware/authMiddleware');

const router = express.Router();

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'YP-ADMIN-2026';

// Helper to sanitize user output (exclude raw/hashed password)
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

// Helper to generate signed JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id ? String(user._id) : user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/signup - Register new candidate or placement administrator
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      branch,
      rollNo,
      cgpa,
      phone,
      bio,
      skills,
    } = req.body;

    // Field Validations
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid institutional or personal email address' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Security requirement: Password must contain at least 6 characters',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account with email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account is already registered with this email address. Please sign in instead.',
      });
    }

    // Role Security: Prevent unauthorized student elevation to Administrator
    let assignedRole = 'student';
    if (role === 'admin') {
      const passcode = (req.body.adminSecretKey || req.body.adminPasscode || '').trim();
      if (passcode !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: Administrator account creation requires a valid Placement Officer Authorization Key. Students cannot register as administrators.',
        });
      }
      assignedRole = 'admin';
    }

    // Cryptographic Password Hashing with Salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      branch: branch ? branch.trim() : 'CSE',
      rollNo: rollNo ? rollNo.trim() : `YP-${Date.now().toString().slice(-4)}`,
      cgpa: cgpa ? cgpa.trim() : '8.5',
      phone: phone ? phone.trim() : '+91 98765 00000',
      bio: bio ? bio.trim() : 'Enthusiastic candidate seeking placement drives.',
      skills: skills ? skills.trim() : 'Full Stack, Problem Solving, Data Structures',
      status: 'Not Placed',
    });

    // If candidate is a student, sync into student placement pool
    if (user.role === 'student') {
      try {
        const existingStudent = await Student.findOne({ email: normalizedEmail });
        if (!existingStudent) {
          await Student.create({
            name: user.name,
            email: user.email,
            branch: user.branch || 'CSE',
            status: 'Not Placed',
          });
        }
      } catch (err) {
        console.warn('Student directory sync notice:', err.message);
      }
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered and authorized successfully',
      token,
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Internal registration failure' });
  }
});

// POST /api/auth/login - Professional JWT Authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both institutional email and security password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    // Verify Password (supports bcrypt and fallback migration if plain text existed)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password.trim(), user.password);
    } else {
      isMatch = user.password === password.trim();
      // Upgrade plain text to bcrypt
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password.trim(), salt);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Authentication service error' });
  }
});

// GET /api/auth/me - Verify current active JWT token & retrieve fresh session
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Session verification failed' });
  }
});

// PUT /api/auth/profile - Protected profile update
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, branch, rollNo, cgpa, phone, bio, skills, department, roleTitle } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Students cannot elevate their own role to admin
    if (req.body.role && req.body.role !== user.role && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Role elevation not permitted' });
    }

    if (name) user.name = name.trim();
    if (branch) user.branch = branch.trim();
    if (rollNo) user.rollNo = rollNo.trim();
    if (cgpa) user.cgpa = cgpa.trim();
    if (phone) user.phone = phone.trim();
    if (bio) user.bio = bio.trim();
    if (skills) user.skills = skills.trim();

    await user.save();

    // If student, synchronize candidate registry
    if (user.role === 'student') {
      try {
        await Student.findOneAndUpdate(
          { email: user.email },
          { name: user.name, branch: user.branch }
        );
      } catch (e) {
        console.warn('Sync student update notice:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Profile update failure' });
  }
});

module.exports = router;
