const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const studentRoutes = require('./routes/studentRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const companyRoutes = require('./routes/companyRoutes');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');
const Student = require('./models/student');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to PlacementPulse API',
    status: 'Server running',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const databaseState = mongoose.connection.readyState;

  const databaseStatus = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(databaseState === 1 ? 200 : 503).json({
    success: databaseState === 1,
    message: 'PlacementPulse backend health check',
    database: databaseStatus[databaseState] || 'Unknown',
  });
});

// Seed default test accounts if they do not exist
async function seedDefaultAccounts() {
  try {
    const adminEmail = 'admin@yaswanth.edu';
    const studentEmail = 'student@yaswanth.edu';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Avula Yaswanth Reddy',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        branch: 'CSE',
        rollNo: 'YP-DIR-2026-ADM',
        cgpa: '9.5',
        phone: '+91 98765 43210',
        bio: 'Career Development & Corporate Relations Cell Administrator',
        skills: 'Placement Operations, Campus Recruitment, System Administration',
        status: 'Placed',
      });
      console.log('Seeded default Admin user:', adminEmail);
    }

    const existingStudent = await User.findOne({ email: studentEmail });
    if (!existingStudent) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('student123', salt);
      await User.create({
        name: 'Yaswanth Candidate',
        email: studentEmail,
        password: hashedPassword,
        role: 'student',
        branch: 'CSE',
        rollNo: 'YP-2026-CS101',
        cgpa: '8.92',
        phone: '+91 98765 11223',
        bio: 'Final-year Computer Science candidate focused on cloud-native web engineering.',
        skills: 'React.js, Node.js, Three.js, Python, Data Structures',
        status: 'Applied',
      });
      console.log('Seeded default Student user:', studentEmail);
    }

    const existingStudentDoc = await Student.findOne({ email: studentEmail });
    if (!existingStudentDoc) {
      await Student.create({
        name: 'Yaswanth Candidate',
        email: studentEmail,
        branch: 'CSE',
        status: 'Applied',
      });
    }
  } catch (err) {
    console.warn('Seed default accounts warning:', err.message);
  }
}

// Start server only after MongoDB connects
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        'MONGO_URI is missing. Check your backend/.env file.'
      );
    }

    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('MongoDB Atlas connected successfully!');

    await seedDefaultAccounts();

    app.listen(PORT, () => {
      console.log(`PlacementPulse server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  }
}

startServer();
