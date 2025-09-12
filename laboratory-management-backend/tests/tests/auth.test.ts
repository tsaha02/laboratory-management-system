// tests/auth.test.ts
import supertest from 'supertest';
import { app } from '../../src/index'; // We need to export 'app' from index.ts
import db from '../../src/db';

const request = supertest(app);

describe('Auth API', () => {
  beforeEach(async () => {
    // Clean the patients table before each test
    await db('patients').del();
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await db.destroy();
  });

  it('should register a new patient successfully', async () => {
    const res = await request.post('/api/auth/register').send({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.patient).toHaveProperty('email', 'test@example.com');
  });

  it('should log in an existing patient and return tokens', async () => {
    // First, create a user to log in with
    await request.post('/api/auth/register').send({
      fullName: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    });

    // Now, try to log in
    const res = await request.post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    // Check that the refresh token cookie was set
    expect(res.headers['set-cookie'][0]).toContain('refreshToken');
  });
});
