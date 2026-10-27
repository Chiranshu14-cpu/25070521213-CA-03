const express = require('express');
const router = express.Router();
const SavedVehicle = require('../models/SavedVehicle');
const Vehicle = require('../models/Vehicle');
const { requireAuth } = require('../middleware/auth');

// All saved-vehicle routes require authentication
router.use(requireAuth);

// GET /api/saved-vehicles
router.get('/', async (req, res) => {
  try {
    const saved = await SavedVehicle.find({ user: req.user.id })
      .populate('vehicle')
      .sort({ createdAt: -1 });

    // Filter out if any vehicle was deleted
    const validSaved = saved.filter(item => item.vehicle !== null);
    return res.status(200).json({ success: true, count: validSaved.length, saved: validSaved });
  } catch (err) {
    console.error('Get saved vehicles error:', err);
    return res.status(500).json({ error: 'Failed to retrieve saved vehicles.' });
  }
});

// POST /api/saved-vehicles
router.post('/', async (req, res) => {
  try {
    const { vehicleId, vehicleSlug } = req.body;

    let targetVehicleId = vehicleId;
    if (!targetVehicleId && vehicleSlug) {
      const v = await Vehicle.findOne({ slug: vehicleSlug.toLowerCase() });
      if (!v) {
        return res.status(404).json({ error: 'Vehicle not found.' });
      }
      targetVehicleId = v._id;
    }

    if (!targetVehicleId) {
      return res.status(400).json({ error: 'Vehicle ID or slug is required.' });
    }

    // Check if vehicle exists
    const vehicleExists = await Vehicle.findById(targetVehicleId);
    if (!vehicleExists) {
      return res.status(404).json({ error: 'Vehicle does not exist.' });
    }

    // Check if already saved
    const existing = await SavedVehicle.findOne({
      user: req.user.id,
      vehicle: targetVehicleId
    });

    if (existing) {
      return res.status(409).json({ error: 'Vehicle is already saved to your garage.', saved: existing });
    }

    const saved = new SavedVehicle({
      user: req.user.id,
      vehicle: targetVehicleId
    });

    await saved.save();
    await saved.populate('vehicle');

    return res.status(201).json({ success: true, message: 'Vehicle saved to your garage.', saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Vehicle is already in your garage.' });
    }
    console.error('Save vehicle error:', err);
    return res.status(500).json({ error: 'Failed to save vehicle.' });
  }
});

// DELETE /api/saved-vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Support deleting either by SavedVehicle _id OR by vehicle _id
    let saved = await SavedVehicle.findOne({ _id: id, user: req.user.id });
    if (!saved) {
      // Check if the id passed is vehicleId
      saved = await SavedVehicle.findOne({ vehicle: id, user: req.user.id });
    }

    if (!saved) {
      return res.status(404).json({ error: 'Saved vehicle record not found or does not belong to you.' });
    }

    // Strict ownership verification
    if (saved.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You cannot delete this record.' });
    }

    await SavedVehicle.findByIdAndDelete(saved._id);
    return res.status(200).json({ success: true, message: 'Vehicle removed from your garage.' });
  } catch (err) {
    console.error('Delete saved vehicle error:', err);
    return res.status(500).json({ error: 'Failed to remove saved vehicle.' });
  }
});

module.exports = router;
