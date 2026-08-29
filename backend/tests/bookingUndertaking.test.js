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
    name: 'Undertaking Test Student',
    email,
    password: 'Test1234',
    rollNumber,
    registrationType: 'PRIVATE',
  });
  return res.body.data.token;
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

describe('Booking reason and undertaking (Phase 16)', () => {
  it('rejects a booking with no reason', async () => {
    const resource = await createResource();
    const token = await registerStudent('noreason@example.com');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        bookingDate: tomorrow(),
        startTime: '10:00',
        endTime: '11:00',
        undertakingAccepted: true,
      });

    expect(res.status).toBe(400);
  });

  it('rejects a booking with a reason that is too short', async () => {
    const resource = await createResource();
    const token = await registerStudent('shortreason@example.com');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        bookingDate: tomorrow(),
        startTime: '10:00',
        endTime: '11:00',
        reason: 'short',
        undertakingAccepted: true,
      });

    expect(res.status).toBe(400);
  });

  it('rejects a booking where the undertaking was not accepted', async () => {
    const resource = await createResource();
    const token = await registerStudent('noundertaking@example.com');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        bookingDate: tomorrow(),
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Group project meeting for coursework.',
        undertakingAccepted: false,
      });

    expect(res.status).toBe(400);
  });

  it('creates a booking and stores the reason and undertaking flag', async () => {
    const resource = await createResource();
    const token = await registerStudent('gooddata@example.com');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        resourceId: resource.id,
        bookingDate: tomorrow(),
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Group project meeting for coursework.',
        undertakingAccepted: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.reason).toBe('Group project meeting for coursework.');
    expect(res.body.data.undertaking_accepted).toBe(true);
  });
});