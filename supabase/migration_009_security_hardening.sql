-- =============================================================================
-- Migration 009 — Security hardening
--
-- 1. admin_login_attempts : durable brute-force lockout for /api/admin/login
--    (in-memory rate limiting resets on every serverless cold start).
-- 2. admin_sessions       : revocable admin sessions (logout actually revokes).
--
-- Both tables are service-role-only: RLS enabled, no policies, so the anon
-- key cannot read, insert, update or delete anything in them.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. admin_login_attempts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash     TEXT NOT NULL,                -- SHA-256 of the client IP, never the raw IP
  outcome     TEXT NOT NULL DEFAULT 'failed' CHECK (outcome IN ('failed', 'success')),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_login_attempts_ip_time_idx
  ON public.admin_login_attempts (ip_hash, attempted_at DESC);

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lock anon out of admin_login_attempts" ON public.admin_login_attempts;
CREATE POLICY "lock anon out of admin_login_attempts" ON public.admin_login_attempts
  USING (false)
  WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- 2. admin_sessions (jti-based revocation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  jti        TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx
  ON public.admin_sessions (expires_at);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lock anon out of admin_sessions" ON public.admin_sessions;
CREATE POLICY "lock anon out of admin_sessions" ON public.admin_sessions
  USING (false)
  WITH CHECK (false);

COMMIT;
