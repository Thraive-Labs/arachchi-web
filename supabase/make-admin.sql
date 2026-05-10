-- ============================================================
-- Arachchi — Promote a user to admin
-- ============================================================
-- After signing up via the storefront (/register), run this in
-- the Supabase SQL Editor to grant admin access.
--
-- Replace 'your@email.com' with the email you registered with.
-- ============================================================

UPDATE users
SET role = 'admin'
WHERE email = 'your@email.com';

-- Verify the change:
SELECT id, email, role FROM users WHERE email = 'your@email.com';
