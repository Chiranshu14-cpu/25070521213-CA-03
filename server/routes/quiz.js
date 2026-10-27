const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const QuizResult = require('../models/QuizResult');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Scoring helper function
const calculateVehicleMatch = (vehicle, answers) => {
  const { dailyDistance = 50, budgetRange = 'any', seatingNeeds = 5, homeCharging = 'yes', topPriority = 'range' } = answers;

  let totalWeight = 0;
  let earnedScore = 0;
  const reasons = [];
  const missingFields = [];

  // 1. Budget Fit
  // Budget buckets in INR:
  // 'budget': <= 25,00,000
  // 'mid': 25,00,000 - 55,00,000
  // 'premium': 55,00,000 - 90,00,000
  // 'luxury': > 90,00,000
  // 'any': no constraint
  let budgetWeight = topPriority === 'price' ? 40 : 25;
  if (vehicle.priceExShowroomINR !== null && vehicle.priceExShowroomINR !== undefined) {
    totalWeight += budgetWeight;
    const price = vehicle.priceExShowroomINR;
    let budgetScore = 0.5;

    if (budgetRange === 'entry') {
      if (price <= 15000000) {
        budgetScore = 1.0;
        reasons.push('Directly matches your ₹1.2Cr–₹1.5Cr entry luxury target with optimal capability.');
      } else if (price <= 21000000) {
        budgetScore = 0.6;
      } else {
        budgetScore = 0.2;
      }
    } else if (budgetRange === 'executive') {
      if (price >= 14000000 && price <= 21000000) {
        budgetScore = 1.0;
        reasons.push('Prime fit for the executive luxury bracket (₹1.5Cr–₹2.1Cr).');
      } else if (price < 14000000) {
        budgetScore = 0.8;
      } else {
        budgetScore = 0.4;
      }
    } else if (budgetRange === 'prestige') {
      if (price >= 20000000 && price <= 35000000) {
        budgetScore = 1.0;
        reasons.push('Ultra-luxury flagship grade aligned with your ₹2.1Cr–₹3.5Cr requirement.');
      } else if (price < 20000000) {
        budgetScore = 0.7;
      } else {
        budgetScore = 0.5;
      }
    } else if (budgetRange === 'pinnacle') {
      if (price >= 35000000) {
        budgetScore = 1.0;
        reasons.push('Pinnacle bespoke automotive tier matching your ultra-high-net-worth bracket.');
      } else {
        budgetScore = 0.6;
      }
    } else {
      budgetScore = 1.0; // Any budget
    }
    earnedScore += budgetScore * budgetWeight;
  } else {
    missingFields.push('priceExShowroomINR');
  }

  // 2. Range Suitability
  let rangeWeight = topPriority === 'range' ? 45 : 30;
  if (vehicle.rangeKmClaimed) {
    totalWeight += rangeWeight;
    // Typical weekly or buffer requirement: dailyDistance * 4 minimum desired real range
    const desiredBuffer = Math.max(dailyDistance * 3.5, 250);
    const rangeRatio = vehicle.rangeKmClaimed / desiredBuffer;

    let rangeScore = 0;
    if (rangeRatio >= 1.5) {
      rangeScore = 1.0;
      reasons.push(`Superior ${vehicle.rangeKmClaimed} km claimed range gives effortless multi-day autonomy for your ${dailyDistance} km daily driving.`);
    } else if (rangeRatio >= 1.0) {
      rangeScore = 0.85;
      reasons.push(`Generous ${vehicle.rangeKmClaimed} km range comfortably handles your ${dailyDistance} km commute with charging headroom.`);
    } else if (rangeRatio >= 0.7) {
      rangeScore = 0.6;
    } else {
      rangeScore = 0.3;
    }
    earnedScore += rangeScore * rangeWeight;
  } else {
    missingFields.push('rangeKmClaimed');
  }

  // 3. Performance / Acceleration
  let perfWeight = topPriority === 'performance' ? 35 : 15;
  if (vehicle.acceleration0to100 !== null && vehicle.acceleration0to100 !== undefined) {
    totalWeight += perfWeight;
    // 0-100: under 3.5s is super-car tier (1.0), 3.5-5.5s is sports (0.85), 5.5-8.5s is brisk (0.7), >8.5s (0.5)
    let perfScore = 0.5;
    if (vehicle.acceleration0to100 <= 3.2) {
      perfScore = 1.0;
      if (topPriority === 'performance') reasons.push(`Sub-3.5s acceleration (0-100 in ${vehicle.acceleration0to100}s) perfectly matches your high-performance focus.`);
    } else if (vehicle.acceleration0to100 <= 5.5) {
      perfScore = 0.88;
      if (topPriority === 'performance') reasons.push(`Brisk sports acceleration (0-100 in ${vehicle.acceleration0to100}s) offers spirited performance.`);
    } else if (vehicle.acceleration0to100 <= 8.5) {
      perfScore = 0.72;
    } else {
      perfScore = 0.55;
    }
    earnedScore += perfScore * perfWeight;
  } else {
    missingFields.push('acceleration0to100');
  }

  // 4. Practicality & Seating
  let spaceWeight = topPriority === 'space' ? 30 : 15;
  totalWeight += spaceWeight;
  let spaceScore = 0.8;
  if (seatingNeeds > 5 && vehicle.seats >= seatingNeeds) {
    spaceScore = 1.0;
    reasons.push(`Accommodates ${vehicle.seats} occupants as requested.`);
  } else if (seatingNeeds <= 5 && vehicle.seats >= 5) {
    spaceScore = 0.9;
  } else {
    spaceScore = 0.6;
  }
  if (vehicle.dimensions?.bootSpaceL && vehicle.dimensions.bootSpaceL >= 450) {
    spaceScore = Math.min(1.0, spaceScore + 0.1);
    if (topPriority === 'space') reasons.push(`Generous boot capacity (${vehicle.dimensions.bootSpaceL} L) for luggage and gear.`);
  }
  earnedScore += spaceScore * spaceWeight;

  // 5. Charging Infrastructure Readiness
  let chargeWeight = 15;
  if (vehicle.fastChargeMinutes !== null && vehicle.fastChargeMinutes !== undefined) {
    totalWeight += chargeWeight;
    let chargeScore = 0.7;
    if (homeCharging === 'no') {
      // Fast DC charging becomes critical
      if (vehicle.fastChargeMinutes <= 25) {
        chargeScore = 1.0;
        reasons.push(`Ultra-fast DC charging (${vehicle.fastChargeMinutes} mins 10-80%) compensates for lack of home charging.`);
      } else if (vehicle.fastChargeMinutes <= 40) {
        chargeScore = 0.8;
      } else {
        chargeScore = 0.5;
      }
    } else {
      chargeScore = 0.9;
    }
    earnedScore += chargeScore * chargeWeight;
  } else {
    missingFields.push('fastChargeMinutes');
  }

  // Compute final percentage
  const matchPercentage = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 50;

  // Primary summary reason
  const primaryReason = reasons.length > 0
    ? reasons[0]
    : `Well-rounded ${vehicle.category} configuration with verified engineering specs.`;

  return {
    matchPercentage,
    score: Math.round(earnedScore),
    totalWeight,
    primaryReason,
    reasons,
    missingFields
  };
};

// POST /api/quiz/match
router.post('/match', optionalAuth, async (req, res) => {
  try {
    const { dailyDistance, budgetRange, seatingNeeds, homeCharging, topPriority } = req.body;

    const vehicles = await Vehicle.find();
    if (!vehicles || vehicles.length === 0) {
      return res.status(404).json({ error: 'No vehicles available in the catalog to match against.' });
    }

    const answers = {
      dailyDistance: Number(dailyDistance) || 40,
      budgetRange: budgetRange || 'any',
      seatingNeeds: Number(seatingNeeds) || 5,
      homeCharging: homeCharging || 'yes',
      topPriority: topPriority || 'range'
    };

    const scoredVehicles = vehicles.map(vehicle => {
      const match = calculateVehicleMatch(vehicle, answers);
      return {
        vehicle: vehicle._id,
        vehicleSlug: vehicle.slug,
        vehicleName: vehicle.name,
        manufacturer: vehicle.manufacturer,
        category: vehicle.category,
        priceExShowroomINR: vehicle.priceExShowroomINR,
        rangeKmClaimed: vehicle.rangeKmClaimed,
        heroImage: vehicle.heroImage,
        score: match.score,
        matchPercentage: match.matchPercentage,
        reason: match.primaryReason,
        allReasons: match.reasons,
        missingFields: match.missingFields
      };
    });

    // Sort descending by match percentage
    scoredVehicles.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // If user is authenticated, persist in QuizResult
    let savedResultId = null;
    if (req.user) {
      const quizResult = new QuizResult({
        user: req.user.id,
        answers,
        rankedResults: scoredVehicles.map(item => ({
          vehicle: item.vehicle,
          vehicleSlug: item.vehicleSlug,
          vehicleName: item.vehicleName,
          manufacturer: item.manufacturer,
          score: item.score,
          matchPercentage: item.matchPercentage,
          reason: item.reason
        }))
      });
      await quizResult.save();
      savedResultId = quizResult._id;
    }

    return res.status(200).json({
      success: true,
      scoringWeights: {
        budget: answers.topPriority === 'price' ? 40 : 25,
        range: answers.topPriority === 'range' ? 45 : 30,
        performance: answers.topPriority === 'performance' ? 35 : 15,
        practicality: answers.topPriority === 'space' ? 30 : 15,
        charging: 15
      },
      savedResultId,
      results: scoredVehicles
    });
  } catch (err) {
    console.error('Quiz match error:', err);
    return res.status(500).json({ error: 'Failed to calculate vehicle matches.' });
  }
});

// GET /api/quiz/results
router.get('/results', requireAuth, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user.id })
      .populate('rankedResults.vehicle')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({ success: true, count: results.length, results });
  } catch (err) {
    console.error('Get quiz results error:', err);
    return res.status(500).json({ error: 'Failed to fetch saved quiz results.' });
  }
});

module.exports = router;
