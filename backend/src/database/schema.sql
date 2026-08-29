-- Users table: stores student and admin accounts
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Resources table: bookable campus resources (labs, halls, equipment, etc.)
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(150) NOT NULL,
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bookings table: links a user to a resource for a specific date/time range
--
-- Deletion behavior (documented as required):
--   - If a USER is deleted, their bookings are deleted too (ON DELETE CASCADE).
--     A booking with no owner isn't meaningful to keep around.
--   - If a RESOURCE has any booking history, it CANNOT be deleted (ON DELETE RESTRICT).
--     This preserves records for auditing. To retire a resource, set its status
--     to UNAVAILABLE instead of deleting it (this is what the admin UI will do
--     in Phase 5 when a delete is blocked).
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Speeds up the overlap-conflict check we'll write in Phase 6
CREATE INDEX IF NOT EXISTS idx_bookings_resource_date ON bookings(resource_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);