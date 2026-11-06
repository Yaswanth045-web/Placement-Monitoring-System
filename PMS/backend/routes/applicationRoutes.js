const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Student = require('../models/student');
const User = require('../models/User');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const allowedStatuses = [
  'Applied',
  'Interview',
  'Selected',
  'Rejected',
];

// Helper to escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Synchronize candidate placement status across Student and User collections
 * whenever an application is created, updated, or deleted.
 *
 * Status Priority Hierarchy:
 * 1. 'Selected' -> Student status is 'Placed'
 * 2. 'Interview' -> Student status is 'Interview'
 * 3. 'Applied'   -> Student status is 'Applied'
 * 4. Otherwise   -> Student status is 'Not Placed'
 */
async function syncStudentStatus(studentId, studentName, forcedStatus = null) {
  try {
    let calculatedStatus = forcedStatus;

    if (!calculatedStatus) {
      const queryConditions = [];
      if (studentId) {
        queryConditions.push({ studentId: String(studentId) });
      }
      if (studentName && typeof studentName === 'string') {
        queryConditions.push({
          studentName: new RegExp(`^${escapeRegex(studentName.trim())}$`, 'i'),
        });
      }

      if (queryConditions.length > 0) {
        // Fetch all active applications for this candidate
        const candidateApps = await Application.find({ $or: queryConditions });

        if (candidateApps.some((a) => a.status === 'Selected')) {
          calculatedStatus = 'Placed';
        } else if (candidateApps.some((a) => a.status === 'Interview')) {
          calculatedStatus = 'Interview';
        } else if (candidateApps.some((a) => a.status === 'Applied')) {
          calculatedStatus = 'Applied';
        } else {
          calculatedStatus = 'Not Placed';
        }
      } else {
        calculatedStatus = 'Not Placed';
      }
    }

    // Locate student in Student collection by ID or name
    const studentQuery = [];
    if (studentId && mongoose.isValidObjectId(studentId)) {
      studentQuery.push({ _id: studentId });
    }
    if (studentName && typeof studentName === 'string') {
      studentQuery.push({
        name: new RegExp(`^${escapeRegex(studentName.trim())}$`, 'i'),
      });
    }

    let updatedStudent = null;
    if (studentQuery.length > 0) {
      updatedStudent = await Student.findOneAndUpdate(
        { $or: studentQuery },
        { status: calculatedStatus },
        { new: true }
      );
    }

    // Also synchronize corresponding User account if one exists
    const userQuery = [];
    if (updatedStudent?.email) {
      userQuery.push({ email: updatedStudent.email.toLowerCase() });
    }
    if (studentName && typeof studentName === 'string') {
      userQuery.push({
        name: new RegExp(`^${escapeRegex(studentName.trim())}$`, 'i'),
      });
    }
    if (userQuery.length > 0) {
      await User.updateMany(
        { $or: userQuery },
        { status: calculatedStatus }
      );
    }

    return { calculatedStatus, updatedStudent };
  } catch (err) {
    console.error('Error synchronizing student placement status:', err);
    return null;
  }
}

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

    // Synchronize candidate status to reflect newly submitted application
    await syncStudentStatus(studentId, studentName);

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

    const existingApp = await Application.findById(id);
    if (!existingApp) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // When status is 'Selected', candidate is placed:
    // Update student directory to 'Placed' and remove the application from active application tracker!
    if (status === 'Selected') {
      await syncStudentStatus(existingApp.studentId, existingApp.studentName, 'Placed');
      await Application.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Candidate selected: Placement status updated to Placed in Student Directory, and application cleared from Application Tracker',
        data: { ...existingApp.toObject(), status: 'Selected' },
        studentStatus: 'Placed',
        removedFromTracker: true,
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    // Immediately synchronize candidate placement status in Student Directory and User records
    const syncResult = await syncStudentStatus(
      application.studentId,
      application.studentName
    );

    res.status(200).json({
      success: true,
      message: 'Application status updated and student directory synchronized',
      data: application,
      studentStatus: syncResult?.calculatedStatus || status,
      removedFromTracker: false,
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

    // Recalculate candidate status after removing application
    await syncStudentStatus(application.studentId, application.studentName);

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

module.exports = router;
