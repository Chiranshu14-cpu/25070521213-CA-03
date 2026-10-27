const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura';

const vehiclesData = [
  {
    slug: 'mercedes-benz-eqs',
    name: 'Mercedes-Benz EQS 580 4MATIC',
    manufacturer: 'Mercedes-Benz',
    category: 'Electric Sedan',
    bodyType: 'Sedan',
    tagline: 'Record-setting aerodynamic luxury with 857 km of ARAI certified range.',
    description: 'The Mercedes-Benz EQS 580 4MATIC is assembled at Chakan, Pune and features the revolutionary 56-inch curved MBUX Hyperscreen. With an astonishing drag coefficient of Cd 0.20 and a 107.8 kWh battery pack, it offers the longest certified electric range in India.',
    priceExShowroomINR: 16200000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 857,
    rangeLabel: 'ARAI-certified',
    batteryKwh: 107.8,
    acceleration0to100: 4.3,
    topSpeedKmh: 210,
    fastChargeMinutes: 31,
    powerBhp: 516,
    torqueNm: 855,
    driveType: 'Dual Motor AWD',
    seats: 5,
    dimensions: {
      lengthMm: 5216,
      widthMm: 1926,
      heightMm: 1512,
      wheelbaseMm: 3210,
      bootSpaceL: 610
    },
    heroImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Mercedes-Benz India Official Portal', 'ARAI Homologation Certificate (857 km)'],
    features: [
      { title: '56-inch MBUX Hyperscreen', description: 'Three high-resolution OLED displays united seamlessly beneath a single contoured glass panel.' },
      { title: 'Rear-Axle Steering (10°)', description: 'Massively reduces the turning circle to just 10.9 meters for agile city maneuvering.' },
      { title: 'Locally Assembled Pune', description: 'First luxury electric vehicle locally assembled in India at Chakan plant.' }
    ],
    isFeatured: true
  },
  {
    slug: 'mercedes-maybach-eqs-suv',
    name: 'Mercedes-Maybach EQS 680 SUV',
    manufacturer: 'Mercedes-Benz',
    category: 'Ultra-Luxury Electric SUV',
    bodyType: 'SUV',
    tagline: 'The pinnacle of automotive prestige, electrified for sublime silence.',
    description: 'The Mercedes-Maybach EQS 680 SUV merges SUV practicality with peerless Maybach craftsmanship. Powered by dual permanently synchronous motors generating 649 bhp and 950 Nm of torque, its cabin features vegetable-tanned Nappa leather and rear Executive First-Class airline seating.',
    priceExShowroomINR: 22500000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 611,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 122.0,
    acceleration0to100: 4.4,
    topSpeedKmh: 210,
    fastChargeMinutes: 31,
    powerBhp: 649,
    torqueNm: 950,
    driveType: 'Dual Motor AWD',
    seats: 4,
    dimensions: {
      lengthMm: 5125,
      widthMm: 2034,
      heightMm: 1721,
      wheelbaseMm: 3210,
      bootSpaceL: 440
    },
    heroImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Mercedes-Benz India (Launched Sept 2024)', 'WLTP Certified Test Cycle'],
    features: [
      { title: 'First-Class Rear Suite', description: 'Reclining rear executive seats with calf massage, folding tables, and silver-plated champagne flutes.' },
      { title: 'Maybach Driving Program', description: 'Specialized air suspension profile calibrated for imperceptible passenger body movements.' },
      { title: 'Burmester 4D Surround Sound', description: '31 speakers with headrest exciters providing tactile acoustic sensations.' }
    ],
    isFeatured: true
  },
  {
    slug: 'mercedes-benz-g-580-electric',
    name: 'Mercedes-Benz G-Class Electric (G 580)',
    manufacturer: 'Mercedes-Benz',
    category: 'Electric Off-Road SUV',
    bodyType: 'SUV',
    tagline: 'The iconic G-Wagen reborn with four individual wheel motors and G-Turn capability.',
    description: 'The Mercedes-Benz G 580 with EQ Technology redefines off-road mastery. Armed with four individually controlled electric motors delivering 579 bhp and 1,164 Nm of torque, it can execute 360-degree G-Turns on the spot, climb 100% grades, and ford water up to 850 mm deep.',
    priceExShowroomINR: 30000000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 473,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 116.0,
    acceleration0to100: 4.7,
    topSpeedKmh: 180,
    fastChargeMinutes: 32,
    powerBhp: 579,
    torqueNm: 1164,
    driveType: 'Quad Motor AWD',
    seats: 5,
    dimensions: {
      lengthMm: 4624,
      widthMm: 1931,
      heightMm: 1986,
      wheelbaseMm: 2890,
      bootSpaceL: 555
    },
    heroImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1541348263662-e0c866c5c9e1?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Mercedes-Benz India Official (Launched Jan 2025)', 'Official Technical Documentation'],
    features: [
      { title: 'G-Turn & G-Steering', description: 'Four electric motors rotate wheels in opposing directions for 360° on-the-spot turns.' },
      { title: 'Carbon-Composite Underbody Protection', description: '26 mm thick armor plate shields the 116 kWh battery during extreme rock-crawling.' },
      { title: 'Virtual Differential Locks', description: 'Millisecond torque vectoring replaces mechanical locking differentials.' }
    ],
    isFeatured: true
  },
  {
    slug: 'bmw-i7',
    name: 'BMW i7 xDrive60',
    manufacturer: 'BMW',
    category: 'Electric Sedan',
    bodyType: 'Sedan',
    tagline: 'Avant-garde luxury with 31.3-inch 8K BMW Theatre Screen entertainment.',
    description: 'The BMW i7 xDrive60 embodies monumental executive presence. Dual fifth-generation eDrive motors produce 536 bhp and 745 Nm of torque. Inside, the rear passenger compartment converts into an ultra-wide cinema lounge with Amazon Fire TV streaming in 8K resolution.',
    priceExShowroomINR: 20300000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 625,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 101.7,
    acceleration0to100: 4.7,
    topSpeedKmh: 240,
    fastChargeMinutes: 34,
    powerBhp: 536,
    torqueNm: 745,
    driveType: 'Dual Motor AWD',
    seats: 5,
    dimensions: {
      lengthMm: 5391,
      widthMm: 1950,
      heightMm: 1544,
      wheelbaseMm: 3215,
      bootSpaceL: 500
    },
    heroImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['BMW India Official Specifications', 'WLTP Worldwide Test Cycle'],
    features: [
      { title: '31.3-inch BMW Theatre Screen', description: 'Ceiling-mounted 8K display folds down automatically with integrated Bowers & Wilkins surround.' },
      { title: 'BMW Interaction Bar', description: 'Faceted crystalline lightbar across dashboard with dynamic mood and safety lighting.' },
      { title: 'Executive Lounge Seating', description: 'Continuous recline with integrated footrest behind front passenger seat.' }
    ],
    isFeatured: true
  },
  {
    slug: 'bmw-ix',
    name: 'BMW iX xDrive50',
    manufacturer: 'BMW',
    category: 'Electric SUV',
    bodyType: 'SUV',
    tagline: 'Pioneering Shy Tech architecture crafted with sustainable carbon cage engineering.',
    description: 'The BMW iX xDrive50 is built upon an innovative aluminum spaceframe with a Carbon Cage passenger cell. Its 111.5 kWh battery pack achieves 635 km of claimed range, driving 516 horsepower through intelligent electric all-wheel drive.',
    priceExShowroomINR: 14000000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 635,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 111.5,
    acceleration0to100: 4.6,
    topSpeedKmh: 200,
    fastChargeMinutes: 35,
    powerBhp: 516,
    torqueNm: 765,
    driveType: 'Dual Motor AWD',
    seats: 5,
    dimensions: {
      lengthMm: 4953,
      widthMm: 1967,
      heightMm: 1696,
      wheelbaseMm: 3000,
      bootSpaceL: 500
    },
    heroImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1541348263662-e0c866c5c9e1?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['BMW India Official Portal', 'WLTP Certified Emission & Range Data'],
    features: [
      { title: 'Shy Tech Intelligence', description: 'Concealed cameras, ultrasonic sensors, and self-healing polyurethane grille coating.' },
      { title: 'Carbon Core Construction', description: 'Carbon-fiber reinforced polymer in side frames, roof, and cowl for low weight.' },
      { title: 'Panoramic Electrochromic Glass', description: 'Largest glass roof in BMW history with liquid crystal shade control at the push of a button.' }
    ],
    isFeatured: false
  },
  {
    slug: 'porsche-taycan',
    name: 'Porsche Taycan',
    manufacturer: 'Porsche',
    category: 'Electric Grand Tourer',
    bodyType: 'Sedan',
    tagline: 'Pure sporting heritage engineered with 800V thermal velocity.',
    description: 'The Porsche Taycan combines iconic sports car proportions with cutting-edge 800-volt battery architecture. With rear-wheel drive and a two-speed transmission on the rear axle, it delivers continuous thermal repeatability and explosive dynamic agility.',
    priceExShowroomINR: 16100000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 504,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 79.2,
    acceleration0to100: 5.4,
    topSpeedKmh: 230,
    fastChargeMinutes: 22.5,
    powerBhp: 402,
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
    verifiedSources: ['Porsche Centre India Official Specifications', 'WLTP Test Documentation'],
    features: [
      { title: '800-Volt Architecture', description: 'Enables high continuous power throughput and ultra-rapid DC charging up to 270 kW.' },
      { title: 'Two-Speed Transmission', description: 'First gear delivers explosive acceleration; second gear optimizes high-speed highway efficiency.' },
      { title: 'Porsche Active Suspension', description: 'Three-chamber adaptive air suspension paired with Electronic Damper Control.' }
    ],
    isFeatured: true
  },
  {
    slug: 'audi-e-tron-gt',
    name: 'Audi e-tron GT quattro',
    manufacturer: 'Audi',
    category: 'Electric Grand Tourer',
    bodyType: 'Sedan',
    tagline: 'Gran Turismo proportions sculpted with 800V fast-charging precision.',
    description: 'The Audi e-tron GT quattro expresses aerodynamic aesthetics in their purest form. Dual electric motors generate 523 bhp in boost mode, sprinting from 0 to 100 km/h in 4.1 seconds. Its 800V architecture charges from 10% to 80% in only 22.5 minutes.',
    priceExShowroomINR: 17200000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 500,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 93.4,
    acceleration0to100: 4.1,
    topSpeedKmh: 245,
    fastChargeMinutes: 22.5,
    powerBhp: 523,
    torqueNm: 640,
    driveType: 'Dual Motor AWD',
    seats: 4,
    dimensions: {
      lengthMm: 4989,
      widthMm: 1964,
      heightMm: 1413,
      wheelbaseMm: 2900,
      bootSpaceL: 405
    },
    heroImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1541348263662-e0c866c5c9e1?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Audi India Official Product Guide', 'WLTP Cycle Certification'],
    features: [
      { title: 'Electric quattro AWD', description: 'Continuously variable torque distribution between axles within fractions of a second.' },
      { title: 'Audi Laser Light Matrix', description: 'Laser spot technology doubles the high-beam illumination range on unlit highways.' },
      { title: 'Active Aerodynamics', description: 'Multi-stage extending rear spoiler and controllable air intakes for cooling brakes.' }
    ],
    isFeatured: false
  },
  {
    slug: 'rolls-royce-spectre',
    name: 'Rolls-Royce Spectre',
    manufacturer: 'Rolls-Royce',
    category: 'Ultra-Luxury Electric Coupe',
    bodyType: 'Coupe',
    tagline: 'The worlds first ultra-luxury electric super coupe, whispered into reality.',
    description: 'The Rolls-Royce Spectre marks the dawn of electric motoring for the worlds pinnacle luxury marque. Built on the proprietary all-aluminium Architecture of Luxury, it delivers 577 bhp and 900 Nm of silent torque with Planar Suspension magic-carpet ride technology.',
    priceExShowroomINR: 75000000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 530,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 102.0,
    acceleration0to100: 4.5,
    topSpeedKmh: 250,
    fastChargeMinutes: 34,
    powerBhp: 577,
    torqueNm: 900,
    driveType: 'Dual Motor AWD',
    seats: 4,
    dimensions: {
      lengthMm: 5453,
      widthMm: 2080,
      heightMm: 1559,
      wheelbaseMm: 3210,
      bootSpaceL: 490
    },
    heroImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Rolls-Royce Motor Cars India Official (Launched Jan 2024)', 'Official Spec Sheet'],
    features: [
      { title: 'Starlight Doors & Fascia', description: '4,796 soft-illuminated fiber-optic stars handcrafted across doors and passenger dashboard.' },
      { title: 'Planar Suspension System', description: 'Decouples anti-roll bars in straight lines for peerless isolation, reattaches on bends.' },
      { title: 'Architecture of Luxury', description: '100% extruded aluminium spaceframe engineered for complete acoustic isolation.' }
    ],
    isFeatured: true
  },
  {
    slug: 'audi-q8-e-tron',
    name: 'Audi Q8 55 e-tron',
    manufacturer: 'Audi',
    category: 'Electric SUV',
    bodyType: 'SUV',
    tagline: 'Executive comfort with 114 kWh high-density battery packaging.',
    description: 'The Audi Q8 55 e-tron elevates luxury electric touring with a massive 114 kWh battery pack delivering up to 582 km of verified WLTP range. Dual asynchronous motors provide 402 bhp with progressive steering and adaptive air suspension as standard equipment.',
    priceExShowroomINR: 12600000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 582,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 114.0,
    acceleration0to100: 5.6,
    topSpeedKmh: 200,
    fastChargeMinutes: 31,
    powerBhp: 402,
    torqueNm: 664,
    driveType: 'Dual Motor AWD',
    seats: 5,
    dimensions: {
      lengthMm: 4915,
      widthMm: 1937,
      heightMm: 1633,
      wheelbaseMm: 2928,
      bootSpaceL: 569
    },
    heroImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Audi India Official Specifications', 'WLTP Test Certification'],
    features: [
      { title: '114 kWh Battery Pack', description: 'Advanced prismatic cell geometry with enhanced thermal liquid cooling plates.' },
      { title: 'Virtual Exterior Mirrors', description: 'Compact cameras replace glass wing mirrors, streaming to OLED door displays.' },
      { title: 'Air Suspension Dampers', description: 'Ride height dynamically adjusts across 76 mm range based on drive mode and speed.' }
    ],
    isFeatured: false
  },
  {
    slug: 'porsche-macan-electric',
    name: 'Porsche Macan Electric (Macan 4)',
    manufacturer: 'Porsche',
    category: 'Electric SUV',
    bodyType: 'SUV',
    tagline: 'Sports car performance in a compact luxury SUV on the 800V PPE platform.',
    description: 'The all-new Porsche Macan Electric is built on the innovative Premium Platform Electric (PPE). Featuring an 800-volt electrical system and a 100 kWh battery, it pumps out 402 bhp with launch control, rocketing from 0-100 in 5.2 seconds and recharges 10-80% in 21 minutes.',
    priceExShowroomINR: 12300000,
    priceLabel: 'ex-showroom, approximate, verify with manufacturer',
    rangeKmClaimed: 613,
    rangeLabel: 'WLTP-claimed',
    batteryKwh: 100.0,
    acceleration0to100: 5.2,
    topSpeedKmh: 220,
    fastChargeMinutes: 21,
    powerBhp: 402,
    torqueNm: 650,
    driveType: 'Dual Motor AWD',
    seats: 5,
    dimensions: {
      lengthMm: 4784,
      widthMm: 1938,
      heightMm: 1622,
      wheelbaseMm: 2893,
      bootSpaceL: 540
    },
    heroImage: 'https://images.unsplash.com/photo-1541348263662-e0c866c5c9e1?auto=format&fit=crop&w=1200&q=80',
    exteriorImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    verifiedSources: ['Porsche Centre India (Launched Early 2024)', 'PPE Platform Specifications'],
    features: [
      { title: '800V PPE Architecture', description: 'Recharges from 10% to 80% SoC in just 21 minutes at compatible 270 kW DC stations.' },
      { title: 'Rear-Axle Steering (5°)', description: 'Improves cornering agility and high-speed stability on winding ghat roads.' },
      { title: 'Porsche Driver Experience', description: '12.6-inch curved instrument cluster paired with augmented reality Head-Up Display.' }
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
      await Vehicle.findOneAndUpdate(
        { slug: vehicleData.slug },
        { $set: vehicleData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      upsertCount++;
      console.log(`  ✓ Upserted: ${vehicleData.name} (${vehicleData.slug})`);
    }

    // Ensure catalog holds exactly the verified models
    const activeSlugs = vehiclesData.map(v => v.slug);
    const pruneResult = await Vehicle.deleteMany({ slug: { $nin: activeSlugs } });
    if (pruneResult.deletedCount > 0) {
      console.log(`[Seed] Pruned ${pruneResult.deletedCount} outdated records outside the active 10-vehicle catalog.`);
    }

    console.log(`[Seed] Completed successfully! Exactly ${upsertCount} verified EVs stored in MongoDB.`);
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
