
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
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

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['Not Placed', 'Applied', 'Interview', 'Placed'],
      default: 'Not Placed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
