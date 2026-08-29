const pool = require('../database/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidReason } = require('../utils/validators');
const { getResourceById } = require('../database/resourceQueries');
const { findUserById } = require('../database/userQueries');
const {
  getBookingById,
  getBookingsByUser,
  getAllBookings,
  findOverlappingBooking,
  insertBooking,
  approveBooking,
  updateBookingStatus,
  modifyBooking,
  cancelBookingById,
  getBookedRanges,
} = require('../database/bookingQueries');
const { createAuditLog } = require('../database/auditLogQueries');
const {
  sendBookingApprovedEmail,
  sendBookingRejectedEmail,
  sendBookingCancelledEmail,
  sendBookingModifiedEmail,
} = require('../services/emailService');
const { generateUndertakingPdfBuffer } = require('../services/pdfService');
const { broadcast } = require('../services/sseService');

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const CONFLICT_MESSAGE =
  'Resource is already booked, awaiting approval, or falls within the required 30-minute gap after another booking during this time';

function formatTime(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : '';
}

function validateBookingInput({ resourceId, bookingDate, startTime, endTime }) {
  if (!resourceId || isNaN(Number(resourceId))) {
    throw new AppError('A valid resourceId is required', 400);
  }
  if (!bookingDate || isNaN(Date.parse(bookingDate))) {
    throw new AppError('A valid bookingDate is required', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(bookingDate) < today) {
    throw new AppError('Booking date cannot be in the past', 400);
  }

  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    throw new AppError('Start and end time must be in HH:MM format', 400);
  }
  if (startTime >= endTime) {
    throw new AppError('End time must be after start time', 400);
  }
}

function notify(sendFn, booking) {
  Promise.all([getResourceById(booking.resource_id), findUserById(booking.user_id)])
    .then(([resource, user]) => sendFn({ user, booking, resource }))
    .catch((error) =>
      console.error(`Notification lookup failed for booking #${booking.id}:`, error.message)
    );
}

function broadcastBookingUpdate(booking) {
  broadcast({
    type: 'BOOKING_STATUS_UPDATED',
    bookingId: booking.id,
    status: booking.status,
    userId: booking.user_id,
  });
}

const createBooking = asyncHandler(async (req, res) => {
  const { resourceId, bookingDate, startTime, endTime, reason, undertakingAccepted } = req.body;

  validateBookingInput({ resourceId, bookingDate, startTime, endTime });

  if (!isValidReason(reason)) {
    throw new AppError('Please provide a reason for this booking (10-500 characters)', 400);
  }
  if (undertakingAccepted !== true) {
    throw new AppError('You must accept the undertaking to submit a booking request', 400);
  }

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  if (resource.status !== 'AVAILABLE') {
    throw new AppError('This resource is not currently available for booking', 400);
  }

  const client = await pool.connect();
  let booking;
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [resourceId]);

    const conflict = await findOverlappingBooking(client, { resourceId, bookingDate, startTime, endTime });
    if (conflict) {
      throw new AppError(CONFLICT_MESSAGE, 409);
    }

    booking = await insertBooking(client, {
      userId: req.user.id,
      resourceId,
      bookingDate,
      startTime,
      endTime,
      reason: reason.trim(),
      undertakingAccepted: true,
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  broadcastBookingUpdate(booking);
  res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await getBookingsByUser(req.user.id);
  res.json({ success: true, message: 'Your bookings retrieved', data: bookings });
});

const getAllBookingsHandler = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const bookings = await getAllBookings({ status });
  res.json({ success: true, message: 'Bookings retrieved', data: bookings });
});

const updateBookingStatusHandler = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError('Status must be APPROVED or REJECTED', 400);
  }

  const booking = await getBookingById(req.params.id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  if (booking.status !== 'PENDING') {
    throw new AppError('This booking has already been processed', 409);
  }

  if (status === 'REJECTED') {
    // Phase 19 — wrapped in its own small transaction (this path never
    // needed the advisory lock/conflict check that APPROVE and MODIFY use)
    // purely so the status update and its audit log row commit together.
    const client = await pool.connect();
    let updated;
    try {
      await client.query('BEGIN');

      updated = await updateBookingStatus(client, req.params.id, status);

      await createAuditLog(client, {
        adminId: req.user.id,
        action: 'REJECT',
        bookingId: updated.id,
        details: `Rejected booking for ${updated.booking_date} ${formatTime(updated.start_time)}-${formatTime(updated.end_time)}`,
      });

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    notify(sendBookingRejectedEmail, updated);
    broadcastBookingUpdate(updated);
    return res.json({ success: true, message: 'Booking rejected successfully', data: updated });
  }

  const client = await pool.connect();
  let updated;
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [booking.resource_id]);

    const conflict = await findOverlappingBooking(client, {
      resourceId: booking.resource_id,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      excludeBookingId: booking.id,
      statuses: ['APPROVED'],
    });
    if (conflict) {
      throw new AppError(
        'This slot now conflicts with an already-approved booking. Reject or cancel the conflicting booking first.',
        409
      );
    }

    updated = await approveBooking(client, req.params.id);

    await createAuditLog(client, {
      adminId: req.user.id,
      action: 'APPROVE',
      bookingId: updated.id,
      details: `Approved booking for ${updated.booking_date} ${formatTime(updated.start_time)}-${formatTime(updated.end_time)}`,
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  notify(sendBookingApprovedEmail, updated);
  broadcastBookingUpdate(updated);
  res.json({ success: true, message: 'Booking approved successfully', data: updated });
});

const modifyBookingHandler = asyncHandler(async (req, res) => {
  const { resourceId, bookingDate, startTime, endTime } = req.body;
  validateBookingInput({ resourceId, bookingDate, startTime, endTime });

  const booking = await getBookingById(req.params.id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  if (!['PENDING', 'APPROVED'].includes(booking.status)) {
    throw new AppError('This booking can no longer be modified', 409);
  }

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  if (resource.status !== 'AVAILABLE') {
    throw new AppError('This resource is not currently available for booking', 400);
  }

  const client = await pool.connect();
  let updated;
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [resourceId]);

    const conflict = await findOverlappingBooking(client, {
      resourceId,
      bookingDate,
      startTime,
      endTime,
      excludeBookingId: booking.id,
    });
    if (conflict) {
      throw new AppError(CONFLICT_MESSAGE, 409);
    }

    updated = await modifyBooking(client, req.params.id, { resourceId, bookingDate, startTime, endTime });

    await createAuditLog(client, {
      adminId: req.user.id,
      action: 'MODIFY',
      bookingId: updated.id,
      details: `Moved from ${booking.booking_date} ${formatTime(booking.start_time)}-${formatTime(booking.end_time)} to ${updated.booking_date} ${formatTime(updated.start_time)}-${formatTime(updated.end_time)}`,
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  notify(sendBookingModifiedEmail, updated);
  broadcastBookingUpdate(updated);
  res.json({ success: true, message: 'Booking updated and returned to pending approval', data: updated });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await getBookingById(req.params.id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (req.user.role === 'STUDENT' && booking.user_id !== req.user.id) {
    throw new AppError('You can only cancel your own bookings', 403);
  }

  if (!['PENDING', 'APPROVED'].includes(booking.status)) {
    throw new AppError('This booking is no longer eligible for cancellation', 409);
  }

  const cancelled = await cancelBookingById(req.params.id);
  notify(sendBookingCancelledEmail, cancelled);
  broadcastBookingUpdate(cancelled);
  res.json({ success: true, message: 'Booking cancelled successfully', data: cancelled });
});

const getResourceAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date || !DATE_REGEX.test(date)) {
    throw new AppError('A valid date query parameter (YYYY-MM-DD) is required', 400);
  }

  const resource = await getResourceById(req.params.id);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }

  const bookedRanges = await getBookedRanges(req.params.id, date);
  res.json({
    success: true,
    message: 'Availability retrieved',
    data: { resourceId: Number(req.params.id), date, bookedRanges },
  });
});

const downloadUndertakingPdf = asyncHandler(async (req, res) => {
  const booking = await getBookingById(req.params.id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }
  if (req.user.role === 'STUDENT' && booking.user_id !== req.user.id) {
    throw new AppError('You can only download the undertaking for your own bookings', 403);
  }

  const [resource, user] = await Promise.all([
    getResourceById(booking.resource_id),
    findUserById(booking.user_id),
  ]);

  const pdfBuffer = await generateUndertakingPdfBuffer({ booking, user, resource });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="undertaking-${booking.id}.pdf"`);
  res.send(pdfBuffer);
});

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookingsHandler,
  updateBookingStatusHandler,
  modifyBookingHandler,
  cancelBooking,
  getResourceAvailability,
  downloadUndertakingPdf,
};