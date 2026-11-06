const express = require('express');
const Drive = require('../models/Drive');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Sample initial drives to seed if collection is empty
const INITIAL_DRIVES = [
  {
    companyName: 'Google India',
    role: 'Software Development Engineer',
    packageCtc: '32 LPA',
    location: 'Bangalore / Hyderabad',
    driveDate: 'Nov 18, 2026',
    deadline: 'Nov 14, 2026',
    minCgpa: '8.0',
    branches: ['CSE', 'IT'],
    rounds: ['Online Coding Challenge', 'Data Structures & Algorithms', 'System Design', 'Googliness & Leadership'],
    description: 'Core engineering drive for scalable web infrastructure and distributed cloud systems.',
    status: 'Active',
  },
  {
    companyName: 'Microsoft',
    role: 'Cloud Solution Associate',
    packageCtc: '26 LPA',
    location: 'Hyderabad / Hybrid',
    driveDate: 'Nov 22, 2026',
    deadline: 'Nov 17, 2026',
    minCgpa: '7.5',
    branches: ['CSE', 'ECE', 'IT'],
    rounds: ['Technical Assessment', 'Live Coding Round', 'Partner Interview'],
    description: 'Azure enterprise cloud computing and intelligent software engineering drive.',
    status: 'Active',
  },
  {
    companyName: 'Amazon',
    role: 'Associate Software Development Engineer',
    packageCtc: '28 LPA',
    location: 'Bangalore / Chennai',
    driveDate: 'Nov 26, 2026',
    deadline: 'Nov 20, 2026',
    minCgpa: '7.0',
    branches: ['CSE', 'ECE', 'IT', 'MECH'],
    rounds: ['Online Assessment (OA1 & OA2)', 'Technical Round 1', 'Bar Raiser Round'],
    description: 'Hiring for AWS and consumer retail logistics platform teams.',
    status: 'Active',
  },
  {
    companyName: 'Adobe',
    role: 'Member of Technical Staff',
    packageCtc: '24 LPA',
    location: 'Noida / Bangalore',
    driveDate: 'Dec 02, 2026',
    deadline: 'Nov 25, 2026',
    minCgpa: '7.8',
    branches: ['CSE', 'IT'],
    rounds: ['Aptitude & DSA Online Test', 'Problem Solving Round', 'Engineering Director Round'],
    description: 'Digital Media and Creative Cloud engineering recruitment drive.',
    status: 'Upcoming',
  },
];

// GET /api/drives - Fetch all campus placement drives
router.get('/', async (req, res) => {
  try {
    let drives = await Drive.find().sort({ createdAt: -1 });

    // Auto-seed sample drives if collection is empty
    if (drives.length === 0) {
      drives = await Drive.insertMany(INITIAL_DRIVES);
    }

    res.json({
      success: true,
      count: drives.length,
      data: drives,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Unable to retrieve drives from database',
    });
  }
});

// POST /api/drives - Create new placement drive (Admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      companyName,
      role,
      packageCtc,
      location,
      driveDate,
      deadline,
      minCgpa,
      branches,
      rounds,
      description,
      status,
    } = req.body;

    if (!companyName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company name and target job role are required.',
      });
    }

    const newDrive = await Drive.create({
      companyName: companyName.trim(),
      role: role.trim(),
      packageCtc: packageCtc || '12 LPA',
      location: location || 'Bangalore / Hybrid',
      driveDate: driveDate || 'TBD',
      deadline: deadline || 'Open',
      minCgpa: minCgpa || '7.0',
      branches: Array.isArray(branches) ? branches : (branches ? branches.split(',').map((b) => b.trim()) : ['CSE', 'ECE', 'IT']),
      rounds: Array.isArray(rounds) ? rounds : (rounds ? rounds.split(',').map((r) => r.trim()) : ['Online Assessment', 'Technical Interview', 'HR']),
      description: description || 'Campus recruitment drive.',
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Placement drive registered successfully in database',
      data: newDrive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register placement drive',
    });
  }
});

// DELETE /api/drives/:id - Delete a placement drive (Admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Drive.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Drive record not found',
      });
    }

    res.json({
      success: true,
      message: 'Drive record removed successfully',
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete drive',
    });
  }
});

module.exports = router;
