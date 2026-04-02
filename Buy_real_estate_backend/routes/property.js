const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find({ isDeleted: false }).skip(skip).limit(limit).lean(),
      Property.countDocuments({ isDeleted: false })
    ]);

    res.json({
      success: true,
      count: properties.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      properties
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
});

// Get single property
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, isDeleted: false }).lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      property
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property'
    });
  }
});

// Create property (any authenticated user)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { type, location, area, nearestLandmark, price } = req.body;

    if (!type || !location || !area || !nearestLandmark || !price) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: type, location, area, nearestLandmark, price'
      });
    }

    const property = new Property({
      type, location, area, nearestLandmark, price,
      createdBy: req.userId
    });
    await property.save();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed while creating property'
    });
  }
});

// Update property (only the creator)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { type, location, area, nearestLandmark, price } = req.body;

    const property = await Property.findOne({ _id: req.params.id, isDeleted: false });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const isOwner = property.createdBy && property.createdBy.toString() === req.userId.toString();
    const isAdmin = req.session.data.role === 'su-admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only update properties you created'
      });
    }

    if (type) property.type = type;
    if (location) property.location = location;
    if (area) property.area = area;
    if (nearestLandmark) property.nearestLandmark = nearestLandmark;
    if (price) property.price = price;

    await property.save();

    res.json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property'
    });
  }
});

// Soft delete property (only the creator)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, isDeleted: false });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const isOwner = property.createdBy && property.createdBy.toString() === req.userId.toString();
    const isAdmin = req.session.data.role === 'su-admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete properties you created'
      });
    }

    property.isDeleted = true;
    await property.save();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property'
    });
  }
});

module.exports = router;
