-- Phase 14: resource images + review system

ALTER TABLE resources ADD COLUMN IF NOT EXISTS image_url TEXT;

-- One review per student per resource (UNIQUE constraint below) — a
-- resubmission updates the existing row instead of creating a new one.
-- Both foreign keys cascade: if a user or resource is ever deleted, their
-- reviews go with them. In practice this rarely fires for resources,
-- since a resource with reviews always has approved booking history too,
-- and bookings.resource_id already blocks that deletion (Phase 5's
-- ON DELETE RESTRICT) before it would ever reach the reviews table.
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT reviews_user_resource_unique UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_resource ON reviews(resource_id);