-- Phase 13: student identity fields on users.
-- Nullable at the DB level — admin accounts never populate these; "required
-- for students" is enforced in application code (authController), because
-- the register endpoint always creates STUDENT accounts.

ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_type VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS club_name VARCHAR(150);

-- roll_number must be unique when present. Postgres allows multiple NULLs
-- in a UNIQUE column (NULL is never considered equal to NULL), so this is
-- safe even though existing admin/student rows have no value yet.
ALTER TABLE users ADD CONSTRAINT users_roll_number_unique UNIQUE (roll_number);

-- roll_number, if present, must be alphanumeric
ALTER TABLE users ADD CONSTRAINT users_roll_number_format
  CHECK (roll_number IS NULL OR roll_number ~ '^[A-Za-z0-9]+$');

-- registration_type, if present, must be one of the two allowed values
ALTER TABLE users ADD CONSTRAINT users_registration_type_check
  CHECK (registration_type IS NULL OR registration_type IN ('PRIVATE', 'CLUB'));

-- club_name is required whenever registration_type is CLUB, and only then.
-- IS DISTINCT FROM treats NULL registration_type as "not CLUB", so admin
-- rows (both columns NULL) satisfy this without any special-casing.
ALTER TABLE users ADD CONSTRAINT users_club_name_required
  CHECK (registration_type IS DISTINCT FROM 'CLUB' OR club_name IS NOT NULL);