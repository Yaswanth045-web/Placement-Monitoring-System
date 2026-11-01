const express = require('express');
const mongoose = require('mongoose');
const Company = require('../models/Company');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all companies (public / student read access)
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error('Fetch companies error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
    });
  }
});

// POST a company (Enforces Administrator Authorization)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, location, industry, website } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    const company = await Company.create({
      name: name.trim(),
      location,
      industry,
      website,
    });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Create company error:', error.message);

    res.status(400).json({
      success: false,
      message: 'Failed to create company',
    });
  }
});

// DELETE a company (Enforces Administrator Authorization)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
      });
    }

    const company = await Company.findByIdAndDelete(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Delete company error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
    });
  }
});

module.exports = router;
