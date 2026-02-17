import request from 'supertest';
import { app } from '../../src/index';
import db from '../../src/db';

let adminToken: string;
let patientToken: string;
let createdTestId: number;

beforeAll(async () => {
  // Clean up and ensure fresh state
  await db('test_package_items').del();
  await db('test_packages').del();
  await db('tests').del();
  await db('users').del();

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create an admin user
  await db('users').insert({
    full_name: 'Test Admin',
    email: 'testadmin@tests.com',
    password: hashedPassword,
    role: 'admin',
  });

  // Create a patient user
  await db('users').insert({
    full_name: 'Test Patient',
    email: 'testpatient@tests.com',
    password: hashedPassword,
    role: 'patient',
  });

  // Login as admin to get token
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'testadmin@tests.com', password: 'Password123!' });
  adminToken = adminRes.body.accessToken;

  // Login as patient to get token
  const patientRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'testpatient@tests.com', password: 'Password123!' });
  patientToken = patientRes.body.accessToken;
});

afterAll(async () => {
  await db('test_package_items').del();
  await db('test_packages').del();
  await db('tests').del();
  await db('users').del();
  await db.destroy();
});

describe('Test CRUD API', () => {
  it('should allow admin to create a test', async () => {
    const res = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Blood Glucose',
        description: 'Measures blood sugar levels.',
        price: 45.0,
        category: 'Endocrinology',
      });

    expect(res.status).toBe(201);
    expect(res.body.test).toHaveProperty('name', 'Blood Glucose');
    expect(res.body.test).toHaveProperty('price', '45.00');
    createdTestId = res.body.test.id;
  });

  it('should block patient from creating a test (403)', async () => {
    const res = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        name: 'Unauthorized Test',
        price: 10.0,
      });

    expect(res.status).toBe(403);
  });

  it('should return all tests (public)', async () => {
    const res = await request(app).get('/api/tests');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should return a single test by id (public)', async () => {
    const res = await request(app).get(`/api/tests/${createdTestId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Blood Glucose');
  });

  it('should allow admin to update a test', async () => {
    const res = await request(app)
      .put(`/api/tests/${createdTestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Blood Glucose (Fasting)', price: 50.0 });

    expect(res.status).toBe(200);
    expect(res.body.test).toHaveProperty('name', 'Blood Glucose (Fasting)');
  });

  it('should allow admin to delete a test', async () => {
    const res = await request(app)
      .delete(`/api/tests/${createdTestId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });

  it('should block patient from deleting a test (403)', async () => {
    // Create a test first so we have something to try to delete
    const createRes = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Temp Test', price: 10 });

    const res = await request(app)
      .delete(`/api/tests/${createRes.body.test.id}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
  });
});
