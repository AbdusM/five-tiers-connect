# Supabase Deployment Steps (Reviews + Receipts)

Use this to finish wiring the production Supabase project. No code changes needed after this.

## 1) Apply schema updates
- File: `supabase/schema.sql`
- Action: In the Supabase Dashboard → SQL Editor, paste and run the file contents.
- What it creates:
  - Tables: `reviews`, `receipts`
  - Indexes, triggers (updated_at), RLS policies for both tables
- If you prefer a smaller snippet, run just this minimal SQL:
  - Create tables `reviews` and `receipts`
  - Indexes: `idx_reviews_business_id`, `idx_reviews_user_id`, `idx_receipts_user_id`, `idx_receipts_date`
  - Triggers: `update_receipts_updated_at`
  - RLS enable: `ALTER TABLE reviews ENABLE ROW LEVEL SECURITY; ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;`
  - Policies:
    - Reviews: read (authenticated), insert/update/delete only when `auth.uid() = user_id`
    - Receipts: read/insert/update/delete only when `auth.uid() = user_id`

## 2) Create the storage bucket for receipts
- Supabase Dashboard → Storage → Create bucket
- Name: `receipts`
- Public access: not required
- This is referenced by the app at bucket `receipts`.

## 3) Environment variables
- Ensure `.env.local` (and your hosted env) includes:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - For local uploads/DB writes, if needed: `SUPABASE_SERVICE_ROLE_KEY` (used by scripts only).

## 4) What’s already done in code
- Reviews UI (partner detail): reads from Supabase `reviews`, allows signed-in users to submit; demo fallback remains.
- Receipts UI: lists/creates receipts and can attach to appointments/vouchers; uses `receipts` table; uploads target `receipts` bucket (demo fallback remains).
- Favorites filter and nav entries are live; Help & Docs nav added.
- Tests: `npm run test:e2e` passes 20/20.

## 5) Optional verification steps (after running SQL + creating bucket)
- In Supabase Table Editor, confirm tables `reviews` and `receipts` exist.
- In Storage, confirm bucket `receipts` exists.
- Run locally with your Supabase env: `npm run dev` then `npm run test:e2e` (optional, takes ~10–15s).

## Links
- Supabase Dashboard: https://app.supabase.com/
- SQL Editor: https://app.supabase.com/project/_/sql (select your project)
- Storage: https://app.supabase.com/project/_/storage (select your project)
