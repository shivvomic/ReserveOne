-- Phase 19: audit trail for administrative booking actions (approve,
-- reject, modify). Cancellation isn't included — only the three actions
-- explicitly in scope for this phase — but this extends cleanly to CANCEL
-- later if wanted: widen the CHECK constraint, add one more
-- createAuditLog() call at the cancel site.
--
-- admin_id / booking_id both ON DELETE SET NULL rather than the Postgres
-- default (NO ACTION) — an audit row should survive even if the admin
-- account or the referenced booking is later removed. Neither actually
-- happens anywhere in this app today (no user-delete feature exists, and
-- bookings are only ever soft-cancelled, never row-deleted), so this is
-- defensive schema design, not something expected to fire in practice.
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVE', 'REJECT', 'MODIFY')),
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);