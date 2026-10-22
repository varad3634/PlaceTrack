import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedData } from '../scripts/seed.js';

describe('PlaceTrack Backend API Automated Tests', () => {
  let adminToken = '';
  let tpoToken = '';
  let studentToken = '';
  let studentProfileId = '';
  let googleDriveId = '';
  let publishedDriveId = '';

  beforeAll(async () => {
    // Seed test database
    await seedData();

    // Login as Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@placetrack.edu', password: 'Password@123' });
    adminToken = adminRes.body.token;

    // Login as TPO
    const tpoRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'tpo@placetrack.edu', password: 'Password@123' });
    tpoToken = tpoRes.body.token;

    // Login as Student (Rahul)
    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rahul.sharma@student.edu', password: 'Password@123' });
    studentToken = studentRes.body.token;
    studentProfileId = studentRes.body.user.profile?._id;
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Authentication & Security Tests', () => {
    it('POST /api/v1/auth/login - should log in valid student and return token with profile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'priya.patel@student.edu', password: 'Password@123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.password).toBeUndefined(); // Password hash must never be returned!
    });

    it('POST /api/v1/auth/login - should reject invalid password with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@placetrack.edu', password: 'WrongPassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('POST /api/v1/auth/login - should reject missing fields with 400 validation error', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notanemail' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me - should reject requests without token with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/admin/users - should reject student role with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  describe('2. Student & Company Management Tests', () => {
    it('GET /api/v1/students - TPO can fetch paginated students list', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.students)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('POST /api/v1/companies - should reject duplicate company name', async () => {
      const res = await request(app)
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${tpoToken}`)
        .send({
          name: 'Google India',
          industry: 'Software & IT',
          hrContactName: 'Test HR',
          hrContactEmail: 'hr@google-dup.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already exists');
    });

    it('PATCH /api/v1/students/:id - student cannot modify administrative field (CGPA)', async () => {
      const res = await request(app)
        .patch(`/api/v1/students/${studentProfileId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cgpa: 9.99 });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not permitted to modify administrative field');
    });
  });

  describe('3. Placement Drives & Eligibility Workflow', () => {
    it('GET /api/v1/drives - fetches published drives with application counts', async () => {
      const res = await request(app)
        .get('/api/v1/drives')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.drives.length).toBeGreaterThan(0);
      const firstDrive = res.body.drives[0];
      publishedDriveId = firstDrive._id;
      expect(firstDrive.status).toBe('Published');
      expect(firstDrive.eligibility).toBeDefined();
    });

    it('GET /api/v1/drives/:id/eligibility - TPO can inspect eligible vs ineligible cohort breakdown', async () => {
      const res = await request(app)
        .get(`/api/v1/drives/${publishedDriveId}/eligibility`)
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.eligibleCount).toBeDefined();
      expect(res.body.ineligibleCount).toBeDefined();
      expect(Array.isArray(res.body.eligible)).toBe(true);
      expect(Array.isArray(res.body.ineligible)).toBe(true);
    });
  });

  describe('4. Applications & State Machine Transitions', () => {
    it('POST /api/v1/applications - prevents duplicate application for the same drive', async () => {
      // Rahul already applied to Google drive during seeding
      const drivesRes = await request(app)
        .get('/api/v1/drives')
        .set('Authorization', `Bearer ${tpoToken}`);

      const googleDrive = drivesRes.body.drives.find((d) => d.jobTitle.includes('Google') || d.company?.name.includes('Google'));
      if (googleDrive) {
        const res = await request(app)
          .post('/api/v1/applications')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ driveId: googleDrive._id });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('already applied');
      }
    });

    it('POST /api/v1/applications - prevents ineligible student application', async () => {
      // Ananya (CGPA 5.85) attempting to apply to Google (Min CGPA 8.5)
      const ananyaLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ananya.iyer@student.edu', password: 'Password@123' });

      const drivesRes = await request(app)
        .get('/api/v1/drives')
        .set('Authorization', `Bearer ${tpoToken}`);

      const highCgpaDrive = drivesRes.body.drives.find((d) => d.minCgpa >= 8.0);
      if (highCgpaDrive) {
        const res = await request(app)
          .post('/api/v1/applications')
          .set('Authorization', `Bearer ${ananyaLogin.body.token}`)
          .send({ driveId: highCgpaDrive._id });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('not eligible');
        expect(res.body.reasons.length).toBeGreaterThan(0);
      }
    });
  });

  describe('5. Dashboard Analytics & Reports', () => {
    it('GET /api/v1/dashboard/summary - calculates dynamic database statistics correctly', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${tpoToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics.totalStudents).toBe(6);
      expect(res.body.metrics.placedStudentsCount).toBe(2); // Rahul and Priya
      expect(res.body.metrics.placementPercentage).toBe(33.3); // (2 / 6) * 100
      expect(Array.isArray(res.body.departmentStats)).toBe(true);
      expect(Array.isArray(res.body.companyStats)).toBe(true);
    });

    it('GET /api/v1/reports/placements - returns department-wise and interview conversion funnel', async () => {
      const res = await request(app)
        .get('/api/v1/reports/placements')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.deptStats)).toBe(true);
      expect(Array.isArray(res.body.interviewFunnel)).toBe(true);
    });
  });
});
