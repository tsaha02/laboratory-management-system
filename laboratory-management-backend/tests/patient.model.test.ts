// tests/patient.model.test.ts
import Patient from '../src/models/patient.model';
import db from '../src/db';

describe('Patient Model', () => {
  beforeEach(async () => {
    await db('patients').del();
    await db('patients').insert({
      full_name: 'Test User',
      email: 'test.user@test.com',
      password: 'hashedpassword',
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should fetch all patients from the database', async () => {
    const patients = await Patient.findAll();
    expect(patients).toHaveLength(1);
    expect(patients[0].email).toBe('test.user@test.com');
  });
});
