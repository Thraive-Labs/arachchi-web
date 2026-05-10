-- ============================================================
-- Arachchi — Supabase Storage Setup
-- ============================================================
-- Run this ONCE in the Supabase SQL Editor after running rls.sql.
--
-- Creates the product-images bucket and sets it to public so
-- uploaded images can be served without authentication.
-- ============================================================

-- ── Create the product-images bucket ───────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,   -- 5 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];


-- ── Storage policies ────────────────────────────────────────────────────
-- Uploads happen server-side via the service role key (bypasses RLS).
-- We only need a public read policy so images are accessible without auth.

CREATE POLICY "product-images: public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Service-role uploads bypass RLS automatically.
-- If you ever need authenticated client uploads, add an INSERT policy here.
