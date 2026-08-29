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
    name: 'Engine Test Student',
    email,
    password: 'Test1234',
    rollNumber,
    registrationType: 'PRIVATE',
  });
  return { token: res.body.data.token, userId: res.body.data.user.id };
}

async function getAdminToken() {
  const admin = await createAdminUser();
  const res = await request(app).post('/api/auth/login').send({
    email: admin.email,
    password: admin.password,
  });
  return res.body.data.token;
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function bookingPayload(overrides = {}) {
  return {
    reason: 'Testing the booking engine.',
    undertakingAccepted: true,
    ...overrides,
  };
}

describe('30-minute trailing buffer', () => {
  it('rejects a new booking starting less than 30 minutes after another ends', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('buffer1@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '10:00', endTime: '11:00' }));

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '11:15', endTime: '12:00' }));

    expect(res.status).toBe(409);
  });

  it('allows a new booking starting exactly 30 minutes after another ends', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('buffer2@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '10:00', endTime: '11:00' }));

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '11:30', endTime: '12:00' }));

    expect(res.status).toBe(201);
  });

  it('does not wrap around midnight for a booking ending late in the day', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('buffer3@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '23:00', endTime: '23:45' }));

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '23:50', endTime: '23:59' }));

    expect(res.status).toBe(409);
  });
});

describe('Approve-time conflict check', () => {
  it('blocks approving a booking that now conflicts with an already-approved one', async () => {
    const resource = await createResource();
    const student1 = await registerStudent('approve1@example.com');
    const student2 = await registerStudent('approve2@example.com');
    const date = tomorrow();

    const insert1 = await pool.query(
      `INSERT INTO bookings (user_id, resource_id, booking_date, start_time, end_time, status)
       VALUES ($1, $2, $3, '10:00', '11:00', 'PENDING') RETURNING id`,
      [student1.userId, resource.id, date]
    );
    const insert2 = await pool.query(
      `INSERT INTO bookings (user_id, resource_id, booking_date, start_time, end_time, status)
       VALUES ($1, $2, $3, '10:15', '11:15', 'PENDING') RETURNING id`,
      [student2.userId, resource.id, date]
    );

    const adminToken = await getAdminToken();

    const firstApproval = await request(app)
      .put(`/api/bookings/${insert1.rows[0].id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });
    expect(firstApproval.status).toBe(200);

    const secondApproval = await request(app)
      .put(`/api/bookings/${insert2.rows[0].id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });
    expect(secondApproval.status).toBe(409);
  });
});

describe('PUT /api/bookings/:id (admin modify)', () => {
  it('moves a booking to a new time and resets it to PENDING', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('modify1@example.com');
    const adminToken = await getAdminToken();
    const date = tomorrow();

    const created = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '09:00', endTime: '10:00' }));

    await request(app)
      .put(`/api/bookings/${created.body.data.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    const res = await request(app)
      .put(`/api/bookings/${created.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resourceId: resource.id, bookingDate: date, startTime: '14:00', endTime: '15:00' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.start_time).toBe('14:00:00');
  });

  it('blocks a student from modifying a booking', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('modify2@example.com');
    const date = tomorrow();

    const created = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '09:00', endTime: '10:00' }));

    const res = await request(app)
      .put(`/api/bookings/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ resourceId: resource.id, bookingDate: date, startTime: '14:00', endTime: '15:00' });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/resources/:id/availability', () => {
  it('returns booked time ranges without any user information', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('avail1@example.com');
    const date = tomorrow();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload({ resourceId: resource.id, bookingDate: date, startTime: '09:00', endTime: '10:00' }));

    const res = await request(app)
      .get(`/api/resources/${resource.id}/availability`)
      .query({ date })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bookedRanges).toHaveLength(1);
    expect(res.body.data.bookedRanges[0]).not.toHaveProperty('user_name');
    expect(res.body.data.bookedRanges[0]).not.toHaveProperty('user_id');
  });
});