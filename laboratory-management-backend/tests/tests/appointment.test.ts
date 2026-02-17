import request from 'supertest';
import { app } from '../../src/index';
import db from '../../src/db';

let adminToken: string;
let patientToken: string;
let techToken: string;
let testId: number;

beforeAll(async () => {
  // Clean up
  await db('appointments').del();
  await db('test_package_items').del();
  await db('test_packages').del();
  await db('tests').del();
  await db('users').del();

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create users
  await db('users').insert({
    full_name: 'Appt Admin',
    email: 'apptadmin@tests.com',
    password: hashedPassword,
    role: 'admin',
  });
  await db('users').insert({
    full_name: 'Appt Patient',
    email: 'apptpatient@tests.com',
    password: hashedPassword,
    role: 'patient',
  });
  await db('users').insert({
    full_name: 'Appt Technician',
    email: 'appttech@tests.com',
    password: hashedPassword,
    role: 'technician',
  });

  // Create a test
  const [test] = await db('tests')
    .insert({ name: 'Appointment Test CBC', price: 75 })
    .returning('id');
  testId = test.id;

  // Login all users
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'apptadmin@tests.com', password: 'Password123!' });
  adminToken = adminRes.body.accessToken;

  const patientRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'apptpatient@tests.com', password: 'Password123!' });
  patientToken = patientRes.body.accessToken;

  const techRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'appttech@tests.com', password: 'Password123!' });
  techToken = techRes.body.accessToken;
});

afterAll(async () => {
  await db('appointments').del();
  await db('test_package_items').del();
  await db('test_packages').del();
  await db('tests').del();
  await db('users').del();
  await db.destroy();
});

// Helper to get a future date string
const getFutureDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

describe('Appointment Booking API', () => {
  let appointmentId: number;

  it('should allow patient to book an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        test_id: testId,
        appointment_date: getFutureDate(5),
        time_slot: '09:00-09:30',
      });

    expect(res.status).toBe(201);
    expect(res.body.appointment).toHaveProperty('time_slot', '09:00-09:30');
    expect(res.body.appointment).toHaveProperty('status', 'pending');
    appointmentId = res.body.appointment.id;
  });

  it('should reject double-booking the same slot (409)', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        test_id: testId,
        appointment_date: getFutureDate(5),
        time_slot: '09:00-09:30',
      });

    expect(res.status).toBe(409);
  });

  it('should return available slots for a date', async () => {
    const res = await request(app)
      .get(`/api/appointments/slots/${getFutureDate(5)}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(18); // 18 time slots

    // The 09:00-09:30 slot should be unavailable
    const bookedSlot = res.body.find(
      (s: any) => s.slot === '09:00-09:30'
    );
    expect(bookedSlot.available).toBe(false);
  });

  it('should allow patient to view own appointments', async () => {
    const res = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should block patient from viewing all appointments (403)', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin/tech to view all appointments', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow admin/tech to update status and assign technician', async () => {
    // Get technician list
    const techList = await request(app)
      .get('/api/appointments/technicians')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(techList.status).toBe(200);

    const technicianId = techList.body[0].id;

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'confirmed',
        technician_id: technicianId,
        notes: 'Confirmed by admin',
      });

    expect(res.status).toBe(200);
    expect(res.body.appointment).toHaveProperty('status', 'confirmed');
    expect(res.body.appointment).toHaveProperty('technician_id', technicianId);
  });
});
