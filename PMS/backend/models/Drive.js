const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    packageCtc: {
      type: String,
      default: '12 LPA',
      trim: true,
    },
    location: {
      type: String,
      default: 'Bangalore / Hybrid',
      trim: true,
    },
    driveDate: {
      type: String,
      default: 'Nov 18, 2026',
      trim: true,
    },
    deadline: {
      type: String,
      default: 'Nov 14, 2026',
      trim: true,
    },
    minCgpa: {
      type: String,
      default: '7.5',
      trim: true,
    },
    branches: {
      type: [String],
      default: ['CSE', 'ECE', 'IT'],
    },
    rounds: {
      type: [String],
      default: ['Online Assessment', 'Technical Round 1', 'HR Interview'],
    },
    description: {
      type: String,
      default: 'Campus recruitment drive for final year engineering students.',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Upcoming', 'Closed'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drive', driveSchema);
