const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database/db');
const resetDatabase = require('./helpers/resetDb');
const createResource = require('./helpers/createResource');

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

async function registerStudent(email) {
  const rollNumber = email.split('@')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const res = await request(app).post('/api/auth/register').send({
    name: 'PDF Test Student',
    email,
    password: 'Test1234',
    rollNumber,
    registrationType: 'PRIVATE',
  });
  return { token: res.body.data.token, userId: res.body.data.user.id };
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

async function createTestBooking(token, resourceId, overrides = {}) {
  return request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      resourceId,
      bookingDate: tomorrow(),
      startTime: '10:00',
      endTime: '11:00',
      reason: 'Testing the undertaking PDF endpoint.',
      undertakingAccepted: true,
      ...overrides,
    });
}

describe('GET /api/bookings/:id/undertaking/pdf', () => {
  it('returns a PDF for the booking owner', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('pdfowner@example.com');
    const created = await createTestBooking(token, resource.id);

    const res = await request(app)
      .get(`/api/bookings/${created.body.data.id}/undertaking/pdf`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  it('blocks a different student from downloading someone else\'s undertaking', async () => {
    const resource = await createResource();
    const owner = await registerStudent('pdfowner2@example.com');
    const intruder = await registerStudent('pdfintruder@example.com');
    const created = await createTestBooking(owner.token, resource.id);

    const res = await request(app)
      .get(`/api/bookings/${created.body.data.id}/undertaking/pdf`)
      .set('Authorization', `Bearer ${intruder.token}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 for a nonexistent booking', async () => {
    const { token } = await registerStudent('pdfnotfound@example.com');

    const res = await request(app)
      .get('/api/bookings/999999/undertaking/pdf')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});