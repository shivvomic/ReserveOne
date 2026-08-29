const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

export function isValidPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function isValidName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

const ROLL_NUMBER_REGEX = /^[A-Za-z0-9]+$/;

// Mirrors backend/src/utils/validators.js — UX only, the backend copy is
// the real enforcement.
export function isValidRollNumber(rollNumber) {
  return (
    typeof rollNumber === 'string' &&
    rollNumber.trim().length >= 3 &&
    rollNumber.trim().length <= 20 &&
    ROLL_NUMBER_REGEX.test(rollNumber.trim())
  );
}

export function isValidClubName(clubName) {
  return typeof clubName === 'string' && clubName.trim().length >= 2;
}

export function isValidReason(reason) {
  return typeof reason === 'string' && reason.trim().length >= 10 && reason.trim().length <= 500;
}