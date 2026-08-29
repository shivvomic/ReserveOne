const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database/db');
const resetDatabase = require('./helpers/resetDb');
const createAdminUser = require('./helpers/createAdmin');

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

async function getStudentToken() {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Auth Student',
    email: 'auth.student@example.com',
    password: 'Test1234',
    rollNumber: 'AUTHSTUDENT',
    registrationType: 'PRIVATE',
  });
  return res.body.data.token;
}

async function getAdminToken() {
  const admin = await createAdminUser();
  const res = await request(app).post('/api/auth/login').send({
    email: admin.email,
    password: admin.password,
  });
  return res.body.data.token;
}

describe('Resource authorization', () => {
  it('blocks a student from creating a resource', async () => {
    const token = await getStudentToken();

    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Room', category: 'Meeting Room', location: 'Block Z' });

    expect(res.status).toBe(403);
  });

  it('allows an admin to create a resource', async () => {
    const token = await getAdminToken();

    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Room', category: 'Meeting Room', location: 'Block Z' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Room');
  });
});

describe('Booking list authorization', () => {
  it('blocks a student from viewing all bookings', async () => {
    const token = await getStudentToken();
    const res = await request(app).get('/api/bookings').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin to view all bookings', async () => {
    const token = await getAdminToken();
    const res = await request(app).get('/api/bookings').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Token via query parameter (Phase 18 — SSE auth fallback)', () => {
  it('accepts a valid token passed as a query parameter', async () => {
    const token = await getStudentToken();
    const res = await request(app).get(`/api/auth/profile?token=${token}`);
    expect(res.status).toBe(200);
  });

  it('still rejects a request with no token at all, header or query', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});