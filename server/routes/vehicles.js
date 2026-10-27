const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { search, manufacturer, bodyType, category, sort } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (manufacturer && manufacturer !== 'All') {
      filter.manufacturer = manufacturer;
    }

    if (bodyType && bodyType !== 'All') {
      filter.bodyType = bodyType;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    let query = Vehicle.find(filter);

    // Sorting
    if (sort === 'price-asc') {
      query = query.sort({ priceExShowroomINR: 1 });
    } else if (sort === 'price-desc') {
      query = query.sort({ priceExShowroomINR: -1 });
    } else if (sort === 'range-desc') {
      query = query.sort({ rangeKmClaimed: -1 });
    } else if (sort === 'acceleration-asc') {
      query = query.sort({ acceleration0to100: 1 });
    } else {
      query = query.sort({ isFeatured: -1, priceExShowroomINR: -1 });
    }

    const vehicles = await query.exec();
    return res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (err) {
    console.error('Get vehicles error:', err);
    return res.status(500).json({ error: 'Failed to retrieve vehicle collection.' });
  }
});

// GET /api/vehicles/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const vehicle = await Vehicle.findOne({ slug: slug.toLowerCase() });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    // Also get related vehicles (same category or manufacturer, excluding this one)
    const related = await Vehicle.find({
      _id: { $ne: vehicle._id },
      $or: [
        { category: vehicle.category },
        { bodyType: vehicle.bodyType }
      ]
    }).limit(3);

    return res.status(200).json({ success: true, vehicle, related });
  } catch (err) {
    console.error('Get vehicle by slug error:', err);
    return res.status(500).json({ error: 'Failed to retrieve vehicle details.' });
  }
});

module.exports = router;
