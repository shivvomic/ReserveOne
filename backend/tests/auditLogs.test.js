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
    name: 'Audit Test Student',
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

async function createTestBooking(token, resourceId) {
  return request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      resourceId,
      bookingDate: tomorrow(),
      startTime: '10:00',
      endTime: '11:00',
      reason: 'Testing audit logging.',
      undertakingAccepted: true,
    });
}

describe('Audit logging on admin actions', () => {
  it('logs an APPROVE action', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('audit1@example.com');
    const adminToken = await getAdminToken();
    const created = await createTestBooking(token, resource.id);

    await request(app)
      .put(`/api/bookings/${created.body.data.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.logs.length).toBeGreaterThan(0);
    expect(res.body.data.logs[0].action).toBe('APPROVE');
    expect(res.body.data.logs[0].booking_id).toBe(created.body.data.id);
  });

  it('logs a REJECT action', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('audit2@example.com');
    const adminToken = await getAdminToken();
    const created = await createTestBooking(token, resource.id);

    await request(app)
      .put(`/api/bookings/${created.body.data.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REJECTED' });

    const res = await request(app)
      .get('/api/admin/audit-logs?action=REJECT')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.logs[0].action).toBe('REJECT');
  });

  it('logs a MODIFY action with before/after details', async () => {
    const resource = await createResource();
    const { token } = await registerStudent('audit3@example.com');
    const adminToken = await getAdminToken();
    const created = await createTestBooking(token, resource.id);

    await request(app)
      .put(`/api/bookings/${created.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resourceId: resource.id, bookingDate: tomorrow(), startTime: '14:00', endTime: '15:00' });

    const res = await request(app)
      .get('/api/admin/audit-logs?action=MODIFY')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.logs[0].action).toBe('MODIFY');
    expect(res.body.data.logs[0].details).toContain('14:00');
  });

  it('blocks a student from viewing audit logs', async () => {
    const { token } = await registerStudent('audit4@example.com');

    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});