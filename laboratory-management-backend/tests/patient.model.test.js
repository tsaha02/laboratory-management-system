const Patient = require('../src/models/patient.model');
const db = require('../src/db'); // our database connection

describe('Patient Model', () => {
  // This hook runs before each test in this block
  beforeEach(async () => {
    // 1. Clean the table to ensure a fresh start
    await db('patients').del();
    // 2. Insert the specific data this test needs
    await db('patients').insert({
      full_name: 'Test User',
      email: 'test.user@test.com',
      password: 'hashedpassword',
    });
  });

  // This hook runs once after all tests in this file are finished
  afterAll(async () => {
    await db.destroy(); // Close the database connection
  });

  it('should fetch all patients from the database', async () => {
    const patients = await Patient.findAll();
    // Now, the test database has exactly one patient that we just created
    expect(patients).toHaveLength(1);
    expect(patients[0].email).toBe('test.user@test.com');
  });
});
