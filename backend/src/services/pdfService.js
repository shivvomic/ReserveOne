const PDFDocument = require('pdfkit');
const { UNDERTAKING_TEXT } = require('../utils/undertakingText');

const PAGE_WIDTH_MINUS_MARGINS = 495; // A4 width (595pt) minus 50pt margins each side

function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatTime(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : '';
}

// Builds the same document whether it's going out as an email attachment
// (Phase 17 email triggers) or a direct browser download (the "Download
// PDF" button) — one generator, one layout, called from both places, so
// the two can never drift out of sync with each other.
function generateUndertakingPdfBuffer({ booking, user, resource }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(18).text('Campus Resource Booking — Undertaking');
    doc
      .moveDown(0.2)
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#64748b')
      .text(`Booking reference #${booking.id}`)
      .fillColor('#000000');

    doc.moveDown(1);
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    const fields = [
      ['Booked by', user?.name || '—'],
      ['Roll number', user?.roll_number || '—'],
      ['Resource', resource?.name || '—'],
      ['Category', resource?.category || '—'],
      ['Date', booking.booking_date],
      ['Time', `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`],
      ['Status', booking.status],
      ['Requested on', formatDateTime(booking.created_at)],
    ];

    doc.fontSize(11);
    fields.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value));
      doc.moveDown(0.3);
    });

    doc.moveDown(0.7);
    doc.font('Helvetica-Bold').fontSize(12).text('Reason for booking');
    doc
      .font('Helvetica')
      .fontSize(10)
      .moveDown(0.2)
      .text(booking.reason || 'No reason provided.', { width: PAGE_WIDTH_MINUS_MARGINS });

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(12).text('Undertaking');
    doc
      .font('Helvetica')
      .fontSize(9)
      .moveDown(0.2)
      .text(UNDERTAKING_TEXT, { width: PAGE_WIDTH_MINUS_MARGINS, align: 'justify' });

    doc.moveDown(1);
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(
        booking.undertaking_accepted
          ? `Undertaking accepted electronically by ${user?.name || 'the student'} at the time of booking.`
          : 'Undertaking not recorded for this booking.'
      );

    doc.end();
  });
}

module.exports = { generateUndertakingPdfBuffer };