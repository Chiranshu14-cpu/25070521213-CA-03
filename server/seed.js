const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura';

const vehiclesData = [
  {
    slug: 'porsche-taycan',
    name: 'Porsche Taycan',
    manufacturer: 'Porsche',
    category: 'Electric Grand Tourer',
    bodyType: 'Sedan',
    tagline: 'Soul, electrified. Pure sporting heritage engineered for zero-emission velocity.',
    description: 'The Porsche Taycan combines iconic sports car proportions with cutting-edge 800-volt battery architecture. With rear-wheel drive and a two-speed transmission on the rear axle, it delivers breathtaking acceleration with continuous thermal repeatability.',
    priceExShowroomINR: 16100000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 504,
    rangeLabel: 'WLTP / claimed',
    batteryKwh: 79.2,
    acceleration0to100: 5.4,
    topSpeedKmh: 230,
    fastChargeMinutes: 22.5,
    powerBhp: 408,
    torqueNm: 345,
    driveType: 'RWD',
    seats: 4,
    dimensions: {
      lengthMm: 4963,
      widthMm: 1966,
      heightMm: 1395,
      wheelbaseMm: 2900,
      bootSpaceL: 407
    },
    heroImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Porsche India Official Specifications', 'WLTP Worldwide Harmonised Light Vehicles Test'],
    features: [
      { title: '800-Volt Architecture', description: 'Enables high continuous power throughput and ultra-rapid DC charging up to 270 kW.' },
      { title: 'Two-Speed Transmission', description: 'First gear delivers explosive acceleration; second gear optimizes high-speed highway efficiency.' },
      { title: 'Porsche Active Suspension', description: 'Three-chamber adaptive air suspension paired with Electronic Damper Control.' }
    ],
    isFeatured: true
  },
  {
    slug: 'bmw-i4-edrive40',
    name: 'BMW i4 eDrive40',
    manufacturer: 'BMW',
    category: 'Electric Sedan',
    bodyType: 'Sedan',
    tagline: 'The first all-electric Gran Coupé with definitive BMW dynamic agility.',
    description: 'The BMW i4 delivers authentic dynamic agility combined with long-distance comfort. Its fifth-generation eDrive motor is electrically excited without rare-earth magnetic metals, providing efficient continuous power across the full rev range.',
    priceExShowroomINR: 7250000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 590,
    rangeLabel: 'manufacturer/ARAI-claimed',
    batteryKwh: 83.9,
    acceleration0to100: 5.7,
    topSpeedKmh: 190,
    fastChargeMinutes: 31,
    powerBhp: 340,
    torqueNm: 430,
    driveType: 'RWD',
    seats: 5,
    dimensions: {
      lengthMm: 4783,
      widthMm: 1852,
      heightMm: 1448,
      wheelbaseMm: 2856,
      bootSpaceL: 470
    },
    heroImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['BMW India Official Portal', 'ARAI Certified Range Certificate'],
    features: [
      { title: 'BMW Curved Display', description: 'Frameless 14.9-inch touchscreen merged with 12.3-inch driver display powered by iDrive 8.5.' },
      { title: 'Rare-Earth Free Motor', description: 'Electrically excited synchronous motor avoids environmentally destructive permanent magnets.' },
      { title: 'Aerodynamic Efficiency', description: 'Cd value of just 0.24 reduces highway aerodynamic drag significantly.' }
    ],
    isFeatured: true
  },
  {
    slug: 'kia-ev6-gt-line',
    name: 'Kia EV6 GT-Line AWD',
    manufacturer: 'Kia',
    category: 'Electric Crossover',
    bodyType: 'Crossover',
    tagline: 'Inspiring design, dual-motor all-wheel drive, and blistering 800V charging.',
    description: 'Built on the specialized Electric-Global Modular Platform (E-GMP), the Kia EV6 offers exceptional interior space with a flat floor and 708 km of ARAI certified range. It is equipped with Vehicle-to-Load (V2L) capability capable of powering external appliances.',
    priceExShowroomINR: 6595000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 708,
    rangeLabel: 'manufacturer/ARAI-claimed',
    batteryKwh: 77.4,
    acceleration0to100: 5.2,
    topSpeedKmh: 192,
    fastChargeMinutes: 18,
    powerBhp: 325,
    torqueNm: 605,
    driveType: 'Dual Motor AWD',
    seats: 5,
    dimensions: {
      lengthMm: 4695,
      widthMm: 1890,
      heightMm: 1550,
      wheelbaseMm: 2900,
      bootSpaceL: 520
    },
    heroImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1541348263662-e0c866c5c9e1?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Kia India Technical Specifications', 'Automotive Research Association of India (ARAI)'],
    features: [
      { title: '800V Multi-Charging System', description: 'Direct 350kW DC compatibility recharges from 10% to 80% in only 18 minutes.' },
      { title: 'Vehicle-to-Load (V2L)', description: 'Bi-directional charging delivers up to 3.6kW of AC electricity for laptop or home backup.' },
      { title: 'Dual Curved Displays', description: 'Twin panoramic 12.3-inch displays with augmented reality head-up display.' }
    ],
    isFeatured: true
  },
  {
    slug: 'hyundai-ioniq-5',
    name: 'Hyundai IONIQ 5',
    manufacturer: 'Hyundai',
    category: 'Electric Crossover',
    bodyType: 'Crossover',
    tagline: 'Retro-futuristic aesthetic inspired by the iconic 1974 Pony Coupe.',
    description: 'The Hyundai IONIQ 5 features Parametric Pixel LED lighting and a modular Living Space interior crafted from eco-processed leather, recycled plastic yarn, and bio-paint. Its ultra-long 3000mm wheelbase rivals full-size luxury sedans.',
    priceExShowroomINR: 4605000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 631,
    rangeLabel: 'manufacturer/ARAI-claimed',
    batteryKwh: 72.6,
    acceleration0to100: 7.6,
    topSpeedKmh: 185,
    fastChargeMinutes: 18,
    powerBhp: 217,
    torqueNm: 350,
    driveType: 'RWD',
    seats: 5,
    dimensions: {
      lengthMm: 4635,
      widthMm: 1890,
      heightMm: 1625,
      wheelbaseMm: 3000,
      bootSpaceL: 527
    },
    heroImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Hyundai Motor India Limited Specifications', 'ARAI MIDC Certified'],
    features: [
      { title: 'Universal Island Console', description: 'Center console slides backwards up to 140 mm for flexible passenger movement.' },
      { title: 'Parametric Pixel Lighting', description: 'Distinctive pixel-art jewel lamps front and rear with kinetic welcome sequences.' },
      { title: 'SmartSense Level 2 ADAS', description: '21 autonomous safety features including Forward Collision-Avoidance Assist.' }
    ],
    isFeatured: false
  },
  {
    slug: 'byd-seal-premium',
    name: 'BYD Seal Premium',
    manufacturer: 'BYD',
    category: 'Electric Sedan',
    bodyType: 'Sedan',
    tagline: 'Ocean Aesthetics design powered by cell-to-body Blade Battery safety.',
    description: 'The BYD Seal features Cell-to-Body (CTB) integration where the battery pack is integrated directly into the chassis floor, achieving remarkable torsional rigidity of 40,500 Nm/degree. Its Blade Battery utilizes lithium iron phosphate (LFP) for superior thermal safety.',
    priceExShowroomINR: 4555000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 650,
    rangeLabel: 'manufacturer/ARAI-claimed',
    batteryKwh: 82.56,
    acceleration0to100: 5.9,
    topSpeedKmh: 180,
    fastChargeMinutes: 37,
    powerBhp: 313,
    torqueNm: 360,
    driveType: 'RWD',
    seats: 5,
    dimensions: {
      lengthMm: 4800,
      widthMm: 1875,
      heightMm: 1460,
      wheelbaseMm: 2920,
      bootSpaceL: 400
    },
    heroImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1541348263662-e0c866c5c9e1?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['BYD Auto India Official Portal', 'NEDC / ARAI Certification Documentation'],
    features: [
      { title: 'Cell-To-Body (CTB) Chassis', description: 'Battery pack functions as a structural sandwich panel inside the monocoque.' },
      { title: 'Rotating 15.6-inch Screen', description: 'Center infotainment display electrically rotates between portrait and landscape modes.' },
      { title: 'iTAC Torque Control', description: 'Intelligent torque adaptation predicts wheel slippage in milliseconds.' }
    ],
    isFeatured: false
  },
  {
    slug: 'tata-nexon-ev-empowered',
    name: 'Tata Nexon.ev Empowered+ LR',
    manufacturer: 'Tata Motors',
    category: 'Electric SUV',
    bodyType: 'SUV',
    tagline: 'Indias favorite electric SUV, reimagined with digital cockpit and V2V power.',
    description: 'The Tata Nexon.ev Empowered+ Long Range is built on the advanced acti.ev architecture. Delivering 465 km of ARAI-claimed range, it features vehicle-to-vehicle (V2V) charging, smart digital daytime running lights with charging indicator animations, and ventilated seating.',
    priceExShowroomINR: 1699000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 465,
    rangeLabel: 'manufacturer/ARAI-claimed',
    batteryKwh: 45.0,
    acceleration0to100: 8.9,
    topSpeedKmh: 150,
    fastChargeMinutes: 56,
    powerBhp: 145,
    torqueNm: 215,
    driveType: 'Single Motor FWD',
    seats: 5,
    dimensions: {
      lengthMm: 3994,
      widthMm: 1811,
      heightMm: 1616,
      wheelbaseMm: 2498,
      bootSpaceL: 350
    },
    heroImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Tata Passenger Electric Mobility (TPEML) Official', 'ARAI MIDC Certified'],
    features: [
      { title: 'acti.ev Architecture', description: 'Native multi-energy platform engineered for maximum high-density battery safety.' },
      { title: 'Smart Digital DRLs', description: 'End-to-end lightbar that displays real-time battery state of charge while plugged in.' },
      { title: 'V2V & V2L Power Delivery', description: 'Can recharge other electric vehicles or run home equipment directly from the port.' }
    ],
    isFeatured: false
  },
  {
    slug: 'mahindra-xuv400-el-pro',
    name: 'Mahindra XUV400 EL Pro',
    manufacturer: 'Mahindra',
    category: 'Electric SUV',
    bodyType: 'SUV',
    tagline: 'Electrifying thrills with C-segment dimensions and rapid dual-zone climate.',
    description: 'The Mahindra XUV400 EL Pro offers spacious interior packaging with a 4.2-meter SUV stance and class-leading width. Its 39.4 kWh battery delivers punchy 310 Nm instant torque with Fun, Fast, and Fearless drive modes.',
    priceExShowroomINR: 1749000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 456,
    rangeLabel: 'manufacturer/ARAI-claimed',
    batteryKwh: 39.4,
    acceleration0to100: 8.3,
    topSpeedKmh: 160,
    fastChargeMinutes: 50,
    powerBhp: 150,
    torqueNm: 310,
    driveType: 'Single Motor FWD',
    seats: 5,
    dimensions: {
      lengthMm: 4200,
      widthMm: 1821,
      heightMm: 1634,
      wheelbaseMm: 2600,
      bootSpaceL: 378
    },
    heroImage: 'https://images.unsplash.com/photo-1541348263662-e0c866c5c9e1?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Mahindra & Mahindra Auto Official portal', 'MIDC Test Cycle Report'],
    features: [
      { title: 'Copper-Accent Dual Tone', description: 'Satin copper roof styling with aerodynamic aero-curtain front bumper intake.' },
      { title: '10.25-inch Dual Cockpit', description: 'Twin HD screens with AdrenoX intelligence and wireless Apple CarPlay.' },
      { title: 'IP67 Ingress Protection', description: 'Water and dust proof battery pack tested for extreme monsoonal conditions.' }
    ],
    isFeatured: false
  }
];

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

    console.log('[Seed] Upserting verified vehicle catalog (idempotent)...');
    let upsertCount = 0;

    for (const vehicleData of vehiclesData) {
      // Upsert by unique slug to preserve integrity without touching user records
      await Vehicle.findOneAndUpdate(
        { slug: vehicleData.slug },
        { $set: vehicleData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      upsertCount++;
      console.log(`  ✓ Upserted: ${vehicleData.name} (${vehicleData.slug})`);
    }

    console.log(`[Seed] Completed successfully! ${upsertCount} vehicles verified and stored in MongoDB.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`[Seed] Error during seeding: ${err.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { vehiclesData, seedDatabase };
