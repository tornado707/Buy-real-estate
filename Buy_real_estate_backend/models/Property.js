const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['House', 'Villa', 'Apartment', 'Land'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  nearestLandmark: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  createdBy: {
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

propertySchema.index({ isDeleted: 1, type: 1 });

propertySchema.index({ isDeleted: 1, price: 1 });

module.exports = mongoose.model('Property', propertySchema);
