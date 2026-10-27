const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electric Sedan', 'Electric SUV', 'Electric Crossover', 'Electric Grand Tourer', 'Electric Hatchback'],
    default: 'Electric SUV'
  },
  bodyType: {
    type: String,
    required: true,
    default: 'SUV'
  },
  tagline: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  priceExShowroomINR: {
    type: Number,
    default: null
  },
  priceLabel: {
    type: String,
    default: 'ex-showroom, approximate, verify with manufacturer'
  },
  rangeKmClaimed: {
    type: Number,
    required: true
  },
  rangeLabel: {
    type: String,
    default: 'manufacturer/ARAI-claimed'
  },
  batteryKwh: {
    type: Number,
    default: null
  },
  acceleration0to100: {
    type: Number,
    default: null
  },
  topSpeedKmh: {
    type: Number,
    default: null
  },
  fastChargeMinutes: {
    type: Number,
    default: null
  },
  powerBhp: {
    type: Number,
    default: null
  },
  torqueNm: {
    type: Number,
    default: null
  },
  driveType: {
    type: String,
    enum: ['RWD', 'AWD', 'FWD', 'Dual Motor AWD', 'Single Motor RWD', 'Single Motor FWD'],
    default: 'RWD'
  },
  seats: {
    type: Number,
    default: 5
  },
  dimensions: {
    lengthMm: { type: Number, default: null },
    widthMm: { type: Number, default: null },
    heightMm: { type: Number, default: null },
    wheelbaseMm: { type: Number, default: null },
    bootSpaceL: { type: Number, default: null }
  },
  heroImage: {
    type: String,
    required: true
  },
  exteriorImage: {
    type: String,
    default: ''
  },
  interiorImage: {
    type: String,
    default: ''
  },
  verifiedSources: [{
    type: String
  }],
  features: [{
    title: String,
    description: String
  }],
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
