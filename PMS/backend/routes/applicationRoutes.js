const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const allowedStatuses = [
  'Applied',
  'Interview',
  'Selected',
  'Rejected',
];

// GET: Retrieve all applications
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
    });
  }
});

// POST: Create an application (student applying or admin enrolling)
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      companyId,
      companyName,
      role,
    } = req.body;

    if (
      !studentId ||
      !studentName ||
      !companyId ||
      !companyName ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: 'All application fields are required',
      });
    }

    const application = await Application.create({
      studentId,
      studentName,
      companyId,
      companyName,
      role,
      status: 'Applied',
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create application',
    });
  }
});

// PATCH: Update application status (Enforces Administrator Authorization)
router.patch('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID',
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status',
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
    });
  }
});

// DELETE: Delete an application (Enforces Administrator Authorization)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID',
      });
    }

    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
    });
  }
});

module.exports = router;
