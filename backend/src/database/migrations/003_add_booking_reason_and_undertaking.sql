-- Phase 16: booking reason + undertaking acceptance.
--
-- reason is nullable at the DB level (existing bookings predate this
-- field); required in application code for every NEW booking going
-- forward — same nullable-at-DB / enforced-in-app pattern used for the
-- Phase 13 identity fields.
--
-- undertaking_accepted has no such conflict: Postgres backfills existing
-- rows with the DEFAULT value in place, so this can be NOT NULL right away.

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE bookings ADD CONSTRAINT bookings_reason_length
  CHECK (reason IS NULL OR char_length(reason) <= 500);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS undertaking_accepted BOOLEAN NOT NULL DEFAULT FALSE;