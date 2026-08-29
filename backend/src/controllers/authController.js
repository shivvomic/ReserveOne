const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidRollNumber,
  isValidRegistrationType,
  isValidClubName,
} = require('../utils/validators');
const {
  findUserByEmail,
  findUserById,
  findUserByRollNumber,
  createUser,
  updateUserProfile,
} = require('../database/userQueries');

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// Shapes a full DB row into the safe object we send to the client — shared
// by register and login so both responses always have the same shape.
function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    rollNumber: user.roll_number,
    registrationType: user.registration_type,
    clubName: user.club_name,
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, rollNumber, registrationType, clubName } = req.body;

  if (!isValidName(name)) {
    throw new AppError('Name must be at least 2 characters', 400);
  }
  if (!isValidEmail(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }
  if (!isValidPassword(password)) {
    throw new AppError(
      'Password must be at least 8 characters and include a letter and a number',
      400
    );
  }
  // Public registration always creates a STUDENT account (role is never
  // read from req.body), so these identity fields are always required
  // here — admin accounts are the only ones exempt, and admins are never
  // created through this endpoint.
  if (!isValidRollNumber(rollNumber)) {
    throw new AppError('Roll number must be 3-20 alphanumeric characters', 400);
  }
  if (!isValidRegistrationType(registrationType)) {
    throw new AppError('Registration type must be PRIVATE or CLUB', 400);
  }
  if (registrationType === 'CLUB' && !isValidClubName(clubName)) {
    throw new AppError('Club name is required for club registrations', 400);
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const trimmedRollNumber = rollNumber.trim();
  const existingRollNumber = await findUserByRollNumber(trimmedRollNumber);
  if (existingRollNumber) {
    throw new AppError('An account with this roll number already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await createUser({
    name,
    email,
    passwordHash,
    role: 'STUDENT',
    rollNumber: trimmedRollNumber,
    registrationType,
    clubName: registrationType === 'CLUB' ? clubName.trim() : null,
  });
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { token, user: toSafeUser(user) },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !password) {
    throw new AppError('Please provide a valid email and password', 400);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: { token, user: toSafeUser(user) },
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json({ success: true, message: 'Profile retrieved', data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!isValidName(name)) {
    throw new AppError('Name must be at least 2 characters', 400);
  }

  const updatedUser = await updateUserProfile(req.user.id, { name });
  res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
});

module.exports = { register, login, getProfile, updateProfile };