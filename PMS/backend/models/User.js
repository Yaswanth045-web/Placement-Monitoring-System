const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    branch: {
      type: String,
      default: 'CSE',
      trim: true,
    },
    rollNo: {
      type: String,
      default: '',
      trim: true,
    },
    cgpa: {
      type: String,
      default: '8.5',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: 'Passionate student preparing for campus placements.',
      trim: true,
    },
    skills: {
      type: String,
      default: 'Full Stack, Data Structures, Problem Solving',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Not Placed', 'Applied', 'Interview', 'Placed'],
      default: 'Not Placed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
