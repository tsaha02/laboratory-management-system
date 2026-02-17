import request from 'supertest';
import { app } from '../../src/index';
import db from '../../src/db';
import path from 'path';
import fs from 'fs';

describe('Report API', () => {
  let patientToken: string;
  let adminToken: string;
  let patientId: number;
  let appointmentId: number;
  let testId: number;
  let reportId: number;

  beforeAll(async () => {
    // 1. Clean up and setup
    await db('reports').del();
    await db('appointments').del();
    await db('tests').del();
    await db('users').del();

    // 2. Create users
    await request(app).post('/api/auth/register').send({
      fullName: 'Patient User',
      email: 'patient@report.com',
      password: 'Password123!',
      role: 'patient',
    });
    const patientLogin = await request(app).post('/api/auth/login').send({
      email: 'patient@report.com',
      password: 'Password123!',
    });
    patientToken = patientLogin.body.accessToken;
    patientId = patientLogin.body.user.id;

    await request(app).post('/api/auth/register').send({
      fullName: 'Admin User',
      email: 'admin@report.com',
      password: 'Password123!',
      role: 'admin',
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@report.com',
      password: 'Password123!',
    });
    adminToken = adminLogin.body.accessToken;

    // 3. Create a test
    const testRes = await db('tests')
      .insert({
        name: 'Blood Test',
        category: 'General',
        price: 50,
        description: 'Standard blood test',
      })
      .returning('*');
    testId = testRes[0].id;

    // 4. Create an appointment
    const apptRes = await db('appointments')
      .insert({
        user_id: patientId,
        test_id: testId,
        appointment_date: '2026-03-01',
        time_slot: '09:00-09:30',
        status: 'confirmed',
      })
      .returning('*');
    appointmentId = apptRes[0].id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/reports/:appointmentId', () => {
    it('should allow admin to upload a report', async () => {
      const filePath = path.join(__dirname, '../fixtures/test_report.pdf');
      // Create a dummy file if it doesn't exist
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }
      fs.writeFileSync(filePath, 'dummy pdf content');

      const res = await request(app)
        .post(`/api/reports/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', filePath)
        .field('doctor_remarks', 'Everything looks normal.');

      expect(res.status).toBe(201);
      expect(res.body.report).toHaveProperty('id');
      expect(res.body.report.doctor_remarks).toBe('Everything looks normal.');
      reportId = res.body.report.id;

      // Verify appointment status updated to completed
      const appt = await db('appointments').where({ id: appointmentId }).first();
      expect(appt.status).toBe('completed');
    });

    it('should not allow patient to upload a report', async () => {
      const res = await request(app)
        .post(`/api/reports/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .attach('file', path.join(__dirname, '../fixtures/test_report.pdf'));

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/reports/my', () => {
    it('should allow patient to see their reports', async () => {
      const res = await request(app)
        .get('/api/reports/my')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].appointment_id).toBe(appointmentId);
    });
  });

  describe('GET /api/reports/appointment/:appointmentId/download', () => {
    it('should allow patient to download their report', async () => {
      const res = await request(app)
        .get(`/api/reports/appointment/${appointmentId}/download`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('application/pdf');
    });

    it('should not allow another patient to download someone elses report (mocked)', async () => {
      // Create another patient
      await request(app).post('/api/auth/register').send({
        fullName: 'Other Patient',
        email: 'other@report.com',
        password: 'Password123!',
        role: 'patient',
      });
      const otherLogin = await request(app).post('/api/auth/login').send({
        email: 'other@report.com',
        password: 'Password123!',
      });
      const otherToken = otherLogin.body.accessToken;

      const res = await request(app)
        .get(`/api/reports/appointment/${appointmentId}/download`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/reports/:id', () => {
    it('should allow admin to update doctor remarks', async () => {
      const res = await request(app)
        .put(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ doctor_remarks: 'Updated remarks.' });

      expect(res.status).toBe(200);
      expect(res.body.report.doctor_remarks).toBe('Updated remarks.');
    });
  });
});
