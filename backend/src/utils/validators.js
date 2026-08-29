const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLL_NUMBER_REGEX = /^[A-Za-z0-9]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

function isValidRollNumber(rollNumber) {
  return (
    typeof rollNumber === 'string' &&
    rollNumber.trim().length >= 3 &&
    rollNumber.trim().length <= 20 &&
    ROLL_NUMBER_REGEX.test(rollNumber.trim())
  );
}

const VALID_REGISTRATION_TYPES = ['PRIVATE', 'CLUB'];

function isValidRegistrationType(registrationType) {
  return VALID_REGISTRATION_TYPES.includes(registrationType);
}

function isValidClubName(clubName) {
  return typeof clubName === 'string' && clubName.trim().length >= 2;
}

// At least 8 characters, with at least one letter and one number
function isValidPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function isValidName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

const VALID_RESOURCE_STATUSES = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];

function isValidResourceStatus(status) {
  return VALID_RESOURCE_STATUSES.includes(status);
}

// Capacity is optional (e.g. a camera has no "capacity"), but if given,
// it must be a positive whole number.
function isValidCapacity(capacity) {
  if (capacity === undefined || capacity === null || capacity === '') return true;
  const num = Number(capacity);
  return Number.isInteger(num) && num > 0;
}

function isValidImageUrl(url) {
  if (url === undefined || url === null || url === '') return true; // optional field
  return typeof url === 'string' && /^https?:\/\/.+/i.test(url.trim());
}

function isValidReason(reason) {
  return typeof reason === 'string' && reason.trim().length >= 10 && reason.trim().length <= 500;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidResourceStatus,
  isValidCapacity,
  isValidRollNumber,
  isValidRegistrationType,
  isValidClubName,
  isValidImageUrl,
  isValidReason,
};