const express = require('express');
const Student = require('../models/student');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET: Retrieve all students (directory view)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
    });
  }
});

// POST: Add a new student (Enforces Administrator Authorization)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, branch, status } = req.body;

    const student = await Student.create({
      name,
      email,
      branch,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A student with this email already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add student',
    });
  }
});

// PATCH: Update student status or details
router.patch('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update student record',
    });
  }
});

// DELETE: Remove a student by MongoDB ID (Enforces Administrator Authorization)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student removed successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove student',
    });
  }
});

module.exports = router;
