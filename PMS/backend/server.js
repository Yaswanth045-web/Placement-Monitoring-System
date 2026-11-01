
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const studentRoutes = require('./routes/studentRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const companyRoutes = require('./routes/companyRoutes');
const authRoutes = require('./routes/authRoutes');

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

    app.listen(PORT, () => {
      console.log(`PlacementPulse server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  }
}

startServer();
