// Mirrors frontend/src/utils/undertakingText.js. Kept as a separate file
// (not a shared package) since the frontend is an ES module Vite bundle and
// the backend is CommonJS — if you ever change the wording, update both.
const UNDERTAKING_TEXT =
  'I confirm that the information provided above is accurate. I understand that I am ' +
  'responsible for the proper use and care of the booked resource for the duration of this ' +
  'booking, and that any damage, misuse, or violation of campus resource policies may result ' +
  'in disciplinary action and/or liability for repair or replacement costs. I understand that ' +
  'this booking is subject to administrative approval and may be rejected, modified, or ' +
  'cancelled by an administrator.';

module.exports = { UNDERTAKING_TEXT };