const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database/db');
const resetDatabase = require('./helpers/resetDb');

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/auth/register', () => {
  it('creates a new student account', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'student.test@example.com',
      password: 'Test1234',
      rollNumber: 'STUDENT001',
      registrationType: 'PRIVATE',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('rejects a duplicate email', async () => {
    const payload = {
      name: 'Test Student',
      email: 'dup.test@example.com',
      password: 'Test1234',
      rollNumber: 'DUP001',
      registrationType: 'PRIVATE',
    };
    await request(app).post('/api/auth/register').send(payload);

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(409);
  });

  it('rejects a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'weak.test@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'login.test@example.com',
      password: 'Test1234',
      rollNumber: 'LOGIN001',
      registrationType: 'PRIVATE',
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login.test@example.com',
      password: 'Test1234',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login.test@example.com',
      password: 'WrongPassword1',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/profile', () => {
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('returns the profile for a valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Profile Test',
      email: 'profile.test@example.com',
      password: 'Test1234',
      rollNumber: 'PROFILE001',
      registrationType: 'PRIVATE',
    });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${registerRes.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('profile.test@example.com');
  });
});