const mongoose = require('mongoose');

const savedVehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user cannot save the same vehicle more than once
savedVehicleSchema.index({ user: 1, vehicle: 1 }, { unique: true });

module.exports = mongoose.model('SavedVehicle', savedVehicleSchema);
