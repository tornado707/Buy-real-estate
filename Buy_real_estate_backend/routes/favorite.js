const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const { isAuthenticated } = require('../middleware/auth');

// Add to favorites
router.post('/:propertyId', isAuthenticated, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.userId;

    const property = await Property.findOne({ _id: propertyId, isDeleted: false }).select('_id').lean();
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const existing = await Favorite.findOne({ userId, propertyId });

    if (existing) {
      if (!existing.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'Property is already in your favorites'
        });
      }

      existing.isDeleted = false;
      await existing.save();

      return res.json({
        success: true,
        message: 'Property added to favorites',
        favorite: existing
      });
    }

    const favorite = new Favorite({ userId, propertyId });
    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Property added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite'
    });
  }
});

// Remove from favorites (soft delete)
router.delete('/:propertyId', isAuthenticated, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.userId;

    const favorite = await Favorite.findOneAndUpdate(
      { userId, propertyId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    //safety check
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Property removed from favorites'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed...'
    });
  }
});

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const total = await Favorite.countDocuments({ userId, isDeleted: false });

    const favorites = await Favorite.find({ userId, isDeleted: false })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'propertyId',
        match: { isDeleted: false }
      })
      .lean();

    const activeFavorites = favorites.filter(f => f.propertyId !== null);

    res.json({
      success: true,
      count: activeFavorites.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      favorites: activeFavorites
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed while fetching favorites'
    });
  }
});

module.exports = router;
