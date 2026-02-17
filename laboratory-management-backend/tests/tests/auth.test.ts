// tests/tests/auth.test.ts
import supertest from 'supertest';
import { app } from '../../src/index';
import db from '../../src/db';

const request = supertest(app);

describe('Auth API', () => {
  beforeEach(async () => {
    // Clean the users table before each test
    await db('users').del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  // ─── Registration Tests ───────────────────────────────────────────
  it('should register a new user successfully with default role', async () => {
    const res = await request.post('/api/auth/register').send({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body.user).toHaveProperty('role', 'patient'); // default role
  });

  it('should register a user with a specified role', async () => {
    const res = await request.post('/api/auth/register').send({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('role', 'admin');
  });

  // ─── Login Tests ──────────────────────────────────────────────────
  it('should log in an existing user and return tokens + role', async () => {
    // First, create a user
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
    expect(res.body.user).toHaveProperty('role', 'patient');
    // Check that the refresh token cookie was set
    expect(res.headers['set-cookie'][0]).toContain('refreshToken');
  });

  // ─── Role-Based Access Tests ──────────────────────────────────────
  it('should allow an admin to access the admin-only route', async () => {
    // Register an admin user
    await request.post('/api/auth/register').send({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    // Log in to get the access token
    const loginRes = await request.post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });
    const token = loginRes.body.accessToken;

    // Access the admin-only route
    const res = await request
      .get('/api/auth/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Admin');
  });

  it('should block a patient from the admin-only route with 403', async () => {
    // Register a patient user
    await request.post('/api/auth/register').send({
      fullName: 'Patient User',
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
    });

    // Log in
    const loginRes = await request.post('/api/auth/login').send({
      email: 'patient@example.com',
      password: 'password123',
    });
    const token = loginRes.body.accessToken;

    // Try to access the admin-only route
    const res = await request
      .get('/api/auth/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });
});
