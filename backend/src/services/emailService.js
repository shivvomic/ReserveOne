const { Resend } = require('resend');
const { generateUndertakingPdfBuffer } = require('./pdfService');

// A dummy fallback string, not a real key, just so `new Resend(...)` never
// throws at require-time if RESEND_API_KEY is unset (e.g. in test env,
// where we never actually reach a real .send() call anyway).
const resend = new Resend(process.env.RESEND_API_KEY || 're_not_configured');
const FROM_ADDRESS = process.env.EMAIL_FROM || 'onboarding@resend.dev';

function isTestEnv() {
  return process.env.NODE_ENV === 'test';
}

function formatTime(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : '';
}

// Every send*Email function below follows the same shape: build a subject +
// HTML body, optionally attach a PDF, and send via Resend. Each one catches
// its own errors internally and never throws — these are always called
// fire-and-forget, *after* the triggering DB transaction has already
// committed, so a failed email must never surface as a failed API request.
// In test runs we skip the real network call entirely (and, for the
// approval path, skip PDF generation too), both to keep the Jest suite
// fast/offline and to avoid spamming real inboxes every time the automated
// tests exercise approve/reject/cancel/modify.

async function sendBookingApprovedEmail({ user, booking, resource }) {
  if (isTestEnv()) {
    console.log(`[email:test] Skipped APPROVED email for booking #${booking.id}`);
    return;
  }
  try {
    const pdfBuffer = await generateUndertakingPdfBuffer({ booking, user, resource });
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: user.email,
      subject: `Booking approved — ${resource.name}`,
      html: `
        <p>Hi ${user.name},</p>
        <p>Your booking for <strong>${resource.name}</strong> on <strong>${booking.booking_date}</strong>
        from <strong>${formatTime(booking.start_time)}</strong> to <strong>${formatTime(booking.end_time)}</strong>
        has been <strong>approved</strong>.</p>
        <p>Your signed undertaking is attached to this email for your records.</p>
      `,
      attachments: [{ filename: `undertaking-${booking.id}.pdf`, content: pdfBuffer }],
    });
  } catch (error) {
    console.error(`Failed to send APPROVED email for booking #${booking.id}:`, error.message);
  }
}

async function sendBookingRejectedEmail({ user, booking, resource }) {
  if (isTestEnv()) {
    console.log(`[email:test] Skipped REJECTED email for booking #${booking.id}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: user.email,
      subject: `Booking rejected — ${resource.name}`,
      html: `
        <p>Hi ${user.name},</p>
        <p>Your booking for <strong>${resource.name}</strong> on <strong>${booking.booking_date}</strong>
        from <strong>${formatTime(booking.start_time)}</strong> to <strong>${formatTime(booking.end_time)}</strong>
        has been <strong>rejected</strong>.</p>
      `,
    });
  } catch (error) {
    console.error(`Failed to send REJECTED email for booking #${booking.id}:`, error.message);
  }
}

// Same wording regardless of whether the student or an admin triggered the
// cancellation (confirmed decision — the end state and required
// information are identical either way).
async function sendBookingCancelledEmail({ user, booking, resource }) {
  if (isTestEnv()) {
    console.log(`[email:test] Skipped CANCELLED email for booking #${booking.id}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: user.email,
      subject: `Booking cancelled — ${resource.name}`,
      html: `
        <p>Hi ${user.name},</p>
        <p>Your booking for <strong>${resource.name}</strong> on <strong>${booking.booking_date}</strong>
        from <strong>${formatTime(booking.start_time)}</strong> to <strong>${formatTime(booking.end_time)}</strong>
        has been <strong>cancelled</strong>.</p>
      `,
    });
  } catch (error) {
    console.error(`Failed to send CANCELLED email for booking #${booking.id}:`, error.message);
  }
}

// Deliberately decoupled from approval (confirmed decision) — modify always
// resets a booking to PENDING (Phase 15), so this is a plain notice with no
// PDF attached. A separate APPROVED email fires later if/when it's actually
// approved.
async function sendBookingModifiedEmail({ user, booking, resource }) {
  if (isTestEnv()) {
    console.log(`[email:test] Skipped MODIFIED email for booking #${booking.id}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: user.email,
      subject: `Booking updated — ${resource.name}`,
      html: `
        <p>Hi ${user.name},</p>
        <p>An administrator updated your booking for <strong>${resource.name}</strong>.
        It is now scheduled for <strong>${booking.booking_date}</strong> from
        <strong>${formatTime(booking.start_time)}</strong> to <strong>${formatTime(booking.end_time)}</strong>,
        and has been returned to <strong>pending approval</strong>.</p>
        <p>You'll receive a separate email once it's reviewed.</p>
      `,
    });
  } catch (error) {
    console.error(`Failed to send MODIFIED email for booking #${booking.id}:`, error.message);
  }
}

module.exports = {
  sendBookingApprovedEmail,
  sendBookingRejectedEmail,
  sendBookingCancelledEmail,
  sendBookingModifiedEmail,
};