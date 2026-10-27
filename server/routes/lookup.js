const express = require('express');
const router = express.Router();
const axios = require('axios');

// In-memory cache for NHTSA responses (10 minutes TTL)
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

const getCached = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setCache = (key, data) => {
  // Cap cache size to avoid memory growth
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { timestamp: Date.now(), data });
};

// GET /api/vehicle-lookup
router.get('/', async (req, res) => {
  const { vin, make, year } = req.query;

  // Mode 1: VIN Decode
  if (vin) {
    const cleanVin = vin.trim().toUpperCase();

    // Standard VIN validation (17 characters alphanumeric, no I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(cleanVin)) {
      return res.status(400).json({
        error: 'Invalid VIN format. A standard VIN must be exactly 17 alphanumeric characters (excluding I, O, and Q).'
      });
    }

    const cacheKey = `vin_${cleanVin}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: 'NHTSA vPIC (Cached)',
        data: cachedData
      });
    }

    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${cleanVin}?format=json`,
        { timeout: 7000 }
      );

      const raw = response.data?.Results?.[0];
      if (!raw) {
        return res.status(404).json({
          error: 'No vehicle data returned from NHTSA for this VIN.'
        });
      }

      // Check for NHTSA error code in response
      // ErrorCode "0" means clean decode
      const result = {
        vin: cleanVin,
        make: raw.Make || 'N/A',
        model: raw.Model || 'N/A',
        modelYear: raw.ModelYear || 'N/A',
        vehicleType: raw.VehicleType || 'N/A',
        bodyClass: raw.BodyClass || 'N/A',
        electrificationLevel: raw.ElectrificationLevel || (raw.FuelTypePrimary?.toLowerCase().includes('electric') ? 'Battery Electric Vehicle (BEV)' : 'N/A'),
        fuelTypePrimary: raw.FuelTypePrimary || 'N/A',
        fuelTypeSecondary: raw.FuelTypeSecondary || 'N/A',
        manufacturer: raw.Manufacturer || 'N/A',
        plantCountry: raw.PlantCountry || 'N/A',
        driveType: raw.DriveType || 'N/A',
        doors: raw.Doors || 'N/A',
        nhtsaErrorCode: raw.ErrorCode,
        nhtsaErrorText: raw.ErrorText
      };

      setCache(cacheKey, result);

      return res.status(200).json({
        success: true,
        source: 'Official US NHTSA vPIC API',
        disclaimer: 'This data is supplementary specification retrieved directly from the US Department of Transportation NHTSA database.',
        data: result
      });
    } catch (err) {
      console.error('NHTSA VIN Lookup Error:', err.message);
      return res.status(502).json({
        error: 'Unable to reach the NHTSA vehicle database at this moment. Please verify your connection or try again shortly.',
        technicalDetail: err.code || err.message
      });
    }
  }

  // Mode 2: Make & Model Lookup
  if (make) {
    const cleanMake = encodeURIComponent(make.trim());
    const modelYear = year ? parseInt(year, 10) : null;
    const cacheKey = `make_${cleanMake}_${modelYear || 'all'}`;

    const cachedData = getCached(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: 'NHTSA vPIC (Cached)',
        data: cachedData
      });
    }

    try {
      let url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${cleanMake}?format=json`;
      if (modelYear && !isNaN(modelYear)) {
        url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${cleanMake}/modelyear/${modelYear}?format=json`;
      }

      const response = await axios.get(url, { timeout: 7000 });
      const rawList = response.data?.Results || [];

      const models = rawList.slice(0, 30).map(item => ({
        makeId: item.Make_ID,
        makeName: item.Make_Name,
        modelId: item.Model_ID,
        modelName: item.Model_Name
      }));

      const result = {
        make: make.trim(),
        year: modelYear || 'All years',
        count: models.length,
        models
      };

      setCache(cacheKey, result);

      return res.status(200).json({
        success: true,
        source: 'Official US NHTSA vPIC API',
        disclaimer: 'Supplementary catalog models from the NHTSA database.',
        data: result
      });
    } catch (err) {
      console.error('NHTSA Make Lookup Error:', err.message);
      return res.status(502).json({
        error: 'Unable to query NHTSA models at this moment. The rest of the AURA platform remains fully functional.',
        technicalDetail: err.code || err.message
      });
    }
  }

  return res.status(400).json({
    error: 'Please specify either a valid 17-character "vin" parameter or a "make" parameter.'
  });
});

module.exports = router;
