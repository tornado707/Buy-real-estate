const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

favoriteSchema.index({ userId: 1, propertyId: 1, isDeleted: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
