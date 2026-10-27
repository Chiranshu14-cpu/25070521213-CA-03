const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// POST /api/estimator/calculate
router.post('/calculate', async (req, res) => {
  try {
    const {
      vehicleId,
      vehicleSlug,
      tripDistanceKm = 350,
      kmPerDay = 45,
      electricityPricePerKwh = 8.5,
      petrolPricePerLitre = 104.0,
      petrolCarEfficiencyKmpl = 14.0,
      realWorldRangeFactor = 0.82
    } = req.body;

    let vehicle;
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
    } else if (vehicleSlug) {
      vehicle = await Vehicle.findOne({ slug: vehicleSlug.toLowerCase() });
    }

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found for estimation.' });
    }

    const tripDist = Math.max(1, Number(tripDistanceKm));
    const dailyDist = Math.max(1, Number(kmPerDay));
    const elecPrice = Math.max(0.1, Number(electricityPricePerKwh));
    const petrolPrice = Math.max(1, Number(petrolPricePerLitre));
    const petrolEfficiency = Math.max(1, Number(petrolCarEfficiencyKmpl));
    const rangeFactor = Math.min(1.0, Math.max(0.5, Number(realWorldRangeFactor)));

    // 1. Range & Trip Calculations
    const claimedRange = vehicle.rangeKmClaimed;
    const realWorldRange = Math.round(claimedRange * rangeFactor);
    const fitsOneCharge = tripDist <= realWorldRange;

    // Remaining distance requiring en-route topups (assuming 80% usable highway leg between charges)
    const usableHighwayLeg = Math.round(realWorldRange * 0.75);
    const chargingStops = fitsOneCharge ? 0 : Math.ceil((tripDist - realWorldRange) / usableHighwayLeg);

    const chargeTimeMinutesPerStop = vehicle.fastChargeMinutes || 35;
    const totalChargingTimeMinutes = chargingStops * chargeTimeMinutesPerStop;

    // 2. Yearly Running Costs
    const yearlyKm = dailyDist * 365;

    // Battery & Consumption
    // If batteryKwh verified: use actual kWh / realWorldRange. Else approximate typical EV efficiency (15 kWh / 100km)
    const batteryCapacity = vehicle.batteryKwh || (claimedRange * 0.16);
    const evKwhPer100Km = Number(((batteryCapacity / realWorldRange) * 100).toFixed(2));

    const evYearlyKwh = (yearlyKm / 100) * evKwhPer100Km;
    const evYearlyCostINR = Math.round(evYearlyKwh * elecPrice);
    const evCostPerKm = Number((evYearlyCostINR / yearlyKm).toFixed(2));

    // Petrol Car Baseline
    const petrolYearlyLitres = yearlyKm / petrolEfficiency;
    const petrolYearlyCostINR = Math.round(petrolYearlyLitres * petrolPrice);
    const petrolCostPerKm = Number((petrolYearlyCostINR / yearlyKm).toFixed(2));

    const yearlySavingsINR = petrolYearlyCostINR - evYearlyCostINR;
    const fiveYearSavingsINR = yearlySavingsINR * 5;

    // 3. Environmental Impact (CO2 Emissions)
    // India CEA Grid average emission factor: ~0.71 kg CO2 / kWh
    // Petrol combustion emission factor: ~2.31 kg CO2 / litre
    const gridEmissionFactorKgPerKwh = 0.71;
    const petrolEmissionFactorKgPerLitre = 2.31;

    const evYearlyCo2Kg = Math.round(evYearlyKwh * gridEmissionFactorKgPerKwh);
    const petrolYearlyCo2Kg = Math.round(petrolYearlyLitres * petrolEmissionFactorKgPerLitre);
    const netCo2SavedKg = Math.max(0, petrolYearlyCo2Kg - evYearlyCo2Kg);

    return res.status(200).json({
      success: true,
      vehicle: {
        id: vehicle._id,
        name: vehicle.name,
        manufacturer: vehicle.manufacturer,
        slug: vehicle.slug,
        claimedRange,
        batteryKwh: vehicle.batteryKwh,
        fastChargeMinutes: vehicle.fastChargeMinutes
      },
      assumptions: {
        realWorldRangeFactor: rangeFactor,
        electricityPricePerKwh: elecPrice,
        petrolPricePerLitre: petrolPrice,
        petrolCarEfficiencyKmpl: petrolEfficiency,
        gridEmissionFactorKgPerKwh,
        petrolEmissionFactorKgPerLitre
      },
      tripFeasibility: {
        tripDistanceKm: tripDist,
        estimatedRealWorldRangeKm: realWorldRange,
        fitsOneCharge,
        chargingStopsNeeded: chargingStops,
        estimatedChargingTimeMinutes: totalChargingTimeMinutes,
        fastChargeTimeVerified: vehicle.fastChargeMinutes !== null
      },
      financialSavings: {
        yearlyKm,
        evCostPerKm,
        petrolCostPerKm,
        evYearlyCostINR,
        petrolYearlyCostINR,
        yearlySavingsINR,
        fiveYearSavingsINR
      },
      environmentalImpact: {
        evYearlyCo2Kg,
        petrolYearlyCo2Kg,
        netCo2SavedKg,
        equivalentTreesPlanted: Math.round(netCo2SavedKg / 22) // ~22kg CO2 per mature tree/year
      }
    });
  } catch (err) {
    console.error('Estimator calculation error:', err);
    return res.status(500).json({ error: 'Failed to calculate running cost estimates.' });
  }
});

module.exports = router;
