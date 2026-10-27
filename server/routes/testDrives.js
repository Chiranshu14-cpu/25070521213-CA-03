const express = require('express');
const router = express.Router();
const TestDriveRequest = require('../models/TestDriveRequest');
const Vehicle = require('../models/Vehicle');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// POST /api/test-drive-requests (Authenticated user or guest)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { vehicleId, vehicleSlug, name, email, preferredDate, timeWindow, message } = req.body;

    if (!name || !email || !preferredDate || !timeWindow) {
      return res.status(400).json({ error: 'Please provide all required fields: name, email, date, and time window.' });
    }

    let targetVehicleId = vehicleId;
    if (!targetVehicleId && vehicleSlug) {
      const v = await Vehicle.findOne({ slug: vehicleSlug.toLowerCase() });
      if (!v) {
        return res.status(404).json({ error: 'Vehicle not found.' });
      }
      targetVehicleId = v._id;
    }

    if (!targetVehicleId) {
      return res.status(400).json({ error: 'Vehicle selection is required.' });
    }

    const vehicle = await Vehicle.findById(targetVehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Selected vehicle does not exist.' });
    }

    // Check valid future date
    const dateObj = new Date(preferredDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided.' });
    }

    const testDrive = new TestDriveRequest({
      user: req.user ? req.user.id : null,
      vehicle: targetVehicleId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      preferredDate: dateObj,
      timeWindow,
      message: message ? message.trim() : '',
      status: 'pending'
    });

    await testDrive.save();
    await testDrive.populate('vehicle');

    return res.status(201).json({
      success: true,
      message: 'Test drive request submitted successfully. A specialist will contact you regarding availability.',
      disclaimer: 'Note: This constitutes an inquiry/request and does not guarantee an immediate appointment slot.',
      request: testDrive
    });
  } catch (err) {
    console.error('Create test drive error:', err);
    return res.status(500).json({ error: 'Failed to submit test drive request.' });
  }
});

// GET /api/test-drive-requests (User's own requests)
router.get('/', requireAuth, async (req, res) => {
  try {
    const requests = await TestDriveRequest.find({ user: req.user.id })
      .populate('vehicle')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: requests.length, requests });
  } catch (err) {
    console.error('Get test drives error:', err);
    return res.status(500).json({ error: 'Failed to fetch test drive requests.' });
  }
});

// PATCH /api/test-drive-requests/:id/cancel
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TestDriveRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Test drive request not found.' });
    }

    // Ownership check
    if (!request.user || request.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You cannot modify this request.' });
    }

    if (request.status === 'cancelled') {
      return res.status(400).json({ error: 'This request is already cancelled.' });
    }

    request.status = 'cancelled';
    await request.save();
    await request.populate('vehicle');

    return res.status(200).json({
      success: true,
      message: 'Test drive request has been cancelled.',
      request
    });
  } catch (err) {
    console.error('Cancel test drive error:', err);
    return res.status(500).json({ error: 'Failed to cancel test drive request.' });
  }
});

module.exports = router;
