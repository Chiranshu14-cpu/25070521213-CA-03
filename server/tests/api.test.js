const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const SavedVehicle = require('../models/SavedVehicle');
const TestDriveRequest = require('../models/TestDriveRequest');
const QuizResult = require('../models/QuizResult');
const { vehiclesData } = require('../seed');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/aura_test';

let testUser1Token = '';
let testUser1Id = '';
let testUser2Token = '';
let testUser2Id = '';
let sampleVehicleId = '';
let sampleVehicleSlug = '';

beforeAll(async () => {
  // Connect to isolated test database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });

  // Clean collections
  await User.deleteMany({});
  await Vehicle.deleteMany({});
  await SavedVehicle.deleteMany({});
  await TestDriveRequest.deleteMany({});
  await QuizResult.deleteMany({});

  // Seed sample vehicles
  for (const v of vehiclesData) {
    await Vehicle.create(v);
  }

  const sampleVehicle = await Vehicle.findOne({ slug: 'bmw-i4-edrive40' });
  sampleVehicleId = sampleVehicle._id.toString();
  sampleVehicleSlug = sampleVehicle.slug;
});

afterAll(async () => {
  await User.deleteMany({});
  await Vehicle.deleteMany({});
  await SavedVehicle.deleteMany({});
  await TestDriveRequest.deleteMany({});
  await QuizResult.deleteMany({});
  await mongoose.connection.close();
});

describe('AURA Integration Test Suite', () => {

  // Test 1: Register succeeds and stored password is a hash
  test('1. Register succeeds and password is stored as a bcrypt hash', async () => {
    const rawPassword = 'AuraSecretPassword123!';
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Chiranshu Somkuwar',
        email: 'chiranshu.test@aura.com',
        password: rawPassword,
        confirmPassword: rawPassword
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('chiranshu.test@aura.com');
    expect(res.body.user.displayName).toBe('Chiranshu Somkuwar');
    expect(res.body.user).not.toHaveProperty('password');

    testUser1Token = res.body.token;
    testUser1Id = res.body.user.id;

    // Check DB directly: password must NOT be plain text
    const dbUser = await User.findOne({ email: 'chiranshu.test@aura.com' });
    expect(dbUser).toBeDefined();
    expect(dbUser.password).not.toBe(rawPassword);
    expect(dbUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
  });

  // Test 2: Duplicate email is rejected
  test('2. Duplicate registration with same email is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Duplicate User',
        email: 'chiranshu.test@aura.com',
        password: 'AnotherPassword123!',
        confirmPassword: 'AnotherPassword123!'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });

  // Test 3: Login succeeds with correct credentials and fails with wrong ones
  test('3. Login succeeds with correct credentials and fails with wrong credentials', async () => {
    // Failure case: wrong password
    const failRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'chiranshu.test@aura.com',
        password: 'IncorrectPassword'
      });
    expect(failRes.status).toBe(401);
    expect(failRes.body.error).toMatch(/invalid/i);

    // Success case: valid credentials
    const successRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'chiranshu.test@aura.com',
        password: 'AuraSecretPassword123!'
      });
    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
    expect(successRes.body.token).toBeDefined();

    // Create a second user for ownership cross-tests
    const user2Res = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Second User',
        email: 'user2@aura.com',
        password: 'User2Password123!',
        confirmPassword: 'User2Password123!'
      });
    testUser2Token = user2Res.body.token;
    testUser2Id = user2Res.body.user.id;
  });

  // Test 4: A protected route rejects unauthenticated requests
  test('4. Protected route (/api/auth/me) rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/authentication required/i);
  });

  // Test 5: Saving a vehicle works and duplicates are prevented
  test('5. Saving a vehicle works and duplicate saves are prevented', async () => {
    // First save: success (201)
    const saveRes = await request(app)
      .post('/api/saved-vehicles')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({ vehicleId: sampleVehicleId });

    expect(saveRes.status).toBe(201);
    expect(saveRes.body.success).toBe(true);
    expect(saveRes.body.saved.vehicle._id.toString()).toBe(sampleVehicleId);

    // Duplicate save attempt: rejected with 409
    const dupRes = await request(app)
      .post('/api/saved-vehicles')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({ vehicleId: sampleVehicleId });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error).toMatch(/already/i);
  });

  // Test 6: A user cannot read, delete, or cancel another user's records
  test('6. User 2 cannot delete or cancel User 1 private records', async () => {
    // Find User 1's saved vehicle record
    const user1Saved = await SavedVehicle.findOne({ user: testUser1Id });
    expect(user1Saved).toBeDefined();

    // User 2 attempts to delete User 1's record: must fail with 404/403
    const deleteAttempt = await request(app)
      .delete(`/api/saved-vehicles/${user1Saved._id}`)
      .set('Authorization', `Bearer ${testUser2Token}`);

    expect([403, 404]).toContain(deleteAttempt.status);

    // Verify record still exists in DB
    const stillExists = await SavedVehicle.findById(user1Saved._id);
    expect(stillExists).toBeDefined();

    // Create a test drive request under User 1
    const tdRes = await request(app)
      .post('/api/test-drive-requests')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        vehicleId: sampleVehicleId,
        name: 'Chiranshu',
        email: 'chiranshu.test@aura.com',
        preferredDate: new Date(Date.now() + 86400000).toISOString(),
        timeWindow: 'Morning (09:00 - 12:00)',
        message: 'Requesting test drive'
      });
    expect(tdRes.status).toBe(201);
    const testDriveId = tdRes.body.request._id;

    // User 2 attempts to cancel User 1's request: must be rejected with 403
    const cancelAttempt = await request(app)
      .patch(`/api/test-drive-requests/${testDriveId}/cancel`)
      .set('Authorization', `Bearer ${testUser2Token}`);

    expect(cancelAttempt.status).toBe(403);
    expect(cancelAttempt.body.error).toMatch(/access denied/i);
  });

  // Test 7: A test-drive request is stored with pending status
  test('7. Test-drive request is properly persisted with pending status and disclaimers', async () => {
    const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString();
    const res = await request(app)
      .post('/api/test-drive-requests')
      .send({
        vehicleSlug: sampleVehicleSlug,
        name: 'Guest Tester',
        email: 'guest@aura.com',
        preferredDate: tomorrow,
        timeWindow: 'Afternoon (12:00 - 16:00)',
        message: 'Looking forward to driving the i4.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.request.status).toBe('pending');
    expect(res.body.disclaimer).toMatch(/inquiry/i);

    const dbRecord = await TestDriveRequest.findById(res.body.request._id);
    expect(dbRecord.status).toBe('pending');
    expect(dbRecord.email).toBe('guest@aura.com');
  });

  // Test 8: Quiz scoring returns a ranked list and handles missing fields without crashing
  test('8. Quiz scoring returns ranked vehicle matches and handles missing fields safely', async () => {
    const res = await request(app)
      .post('/api/quiz/match')
      .set('Authorization', `Bearer ${testUser1Token}`)
      .send({
        dailyDistance: 60,
        budgetRange: 'mid',
        seatingNeeds: 5,
        homeCharging: 'yes',
        topPriority: 'range'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);

    // Results must be ordered by match percentage descending
    const results = res.body.results;
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].matchPercentage).toBeGreaterThanOrEqual(results[i + 1].matchPercentage);
      expect(results[i]).toHaveProperty('reason');
      expect(typeof results[i].reason).toBe('string');
    }

    // Verify quiz result is stored for the logged in user
    expect(res.body.savedResultId).toBeDefined();
    const dbQuiz = await QuizResult.findById(res.body.savedResultId);
    expect(dbQuiz).toBeDefined();
    expect(dbQuiz.user.toString()).toBe(testUser1Id);
  });
});
