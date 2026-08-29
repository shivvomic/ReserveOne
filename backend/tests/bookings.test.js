const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/database/db');
const resetDatabase = require('./helpers/resetDb');
const createResource = require('./helpers/createResource');
const createAdminUser = require('./helpers/createAdmin');

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

async function registerStudent(email) {
  const rollNumber = email.split('@')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const res = await request(app).post('/api/auth/register').send({
    name: 'Booking Student',
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

// Phase 16 — reason and undertaking acceptance are required on every real
// booking request now. This wraps those two fields so each test below
// only has to specify what's actually relevant to it.
function bookingPayload(overrides = {}) {
  return {
    reason: 'Group project meeting for a course assignment.',
    undertakingAccepted: true,
    ...overrides,
  };
}

describe('POST /api/bookings', () => {
  it('creates a booking for a valid, available slot', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('booker1@example.com');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: tomorrow(), startTime: '10:00', endTime: '12:00' }));

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.undertaking_accepted).toBe(true);
  });

  it('rejects an overlapping booking (matches the spec\'s 10-12 / 11-1 example)', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('booker2@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '10:00', endTime: '12:00' }));

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '11:00', endTime: '13:00' }));

    expect(res.status).toBe(409);
  });

  it('rejects a back-to-back booking with no buffer gap (Phase 15)', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('booker3@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '10:00', endTime: '12:00' }));

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '12:00', endTime: '13:00' }));

    expect(res.status).toBe(409);
  });

  it('allows a booking that starts exactly 30 minutes after another ends', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('booker3b@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '10:00', endTime: '12:00' }));

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '12:30', endTime: '13:00' }));

    expect(res.status).toBe(201);
  });

  it('rejects booking a resource that is not AVAILABLE', async () => {
    const resource = await createResource({ status: 'MAINTENANCE' });
    const { token } = await registerStudent('booker4@example.com');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: tomorrow(), startTime: '10:00', endTime: '11:00' }));

    expect(res.status).toBe(400);
  });

  it('rejects an invalid time range where end is before start', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('booker5@example.com');

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: tomorrow(), startTime: '14:00', endTime: '13:00' }));

    expect(res.status).toBe(400);
  });

  it('allows re-booking the same slot after the original is cancelled', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('booker6@example.com');
    const date = tomorrow();

    const first = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '09:00', endTime: '10:00' }));

    await request(app)
      .delete(`/api/bookings/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);

    const second = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '09:00', endTime: '10:00' }));

    expect(second.status).toBe(201);
  });
});

describe('GET /api/bookings/my', () => {
  it('returns only the requesting user\'s own bookings', async () => {
    const resource = await createResource();
    const student1 = await registerStudent('mine@example.com');
    const student2 = await registerStudent('notmine@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${student1.token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '08:00', endTime: '09:00' }));

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${student2.token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '10:00', endTime: '11:00' }));

    const res = await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${student1.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toHaveProperty('reason');
  });
});

describe('DELETE /api/bookings/:id (cancellation ownership)', () => {
  it('blocks a student from cancelling another student\'s booking', async () => {
    const resource = await createResource();
    const owner = await registerStudent('owner@example.com');
    const intruder = await registerStudent('intruder@example.com');

    const booking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: tomorrow(), startTime: '15:00', endTime: '16:00' }));

    const res = await request(app)
      .delete(`/api/bookings/${booking.body.data.id}`)
      .set('Authorization', `Bearer ${intruder.token}`);

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/bookings/:id/status (admin approve)', () => {
  it('allows an admin to approve a pending booking', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('approveme@example.com');
    const admin = await createAdminUser();
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: admin.email,
      password: admin.password,
    });

    const booking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: tomorrow(), startTime: '16:00', endTime: '17:00' }));

    const res = await request(app)
      .put(`/api/bookings/${booking.body.data.id}/status`)
      .set('Authorization', `Bearer ${adminLogin.body.data.token}`)
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });
});