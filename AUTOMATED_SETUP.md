# Automated Setup Guide

## 🚀 One-Command Setup

Run the automated setup script:

```bash
npm run setup
```

Or directly:

```bash
./scripts/setup-automated.sh
```

## What It Does

1. ✅ Checks Supabase CLI installation
2. ✅ Links to your Supabase project (if not already linked)
3. ✅ Creates `.env.local` with your API keys
4. ✅ Applies database schema automatically
5. ✅ Verifies setup completion

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   brew install supabase/tap/supabase
   # or
   npm install -g supabase
   ```

2. **Logged into Supabase**
   ```bash
   supabase login
   ```

3. **Node.js installed** (for schema application)

## Automated Schema Application

The script will try to apply the schema automatically using:

1. **Service Role Key** (recommended)
   - Get from: Supabase Dashboard → Settings → API
   - Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your-key`
   - Allows full automation

2. **Manual Fallback**
   - If service role key not available
   - Script will open SQL Editor URL
   - You paste and run (one-time setup)

## Quick Start

```bash
# 1. Run setup
npm run setup

# 2. Start dev server
npm run dev

# 3. Open browser
open http://localhost:3000
```

## Manual Schema Application (If Needed)

If automated application fails:

1. Go to: `https://your-project.supabase.co/sql/new`
2. Copy contents of `supabase/schema.sql`
3. Paste and run

## Environment Variables

After setup, `.env.local` will contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Optional, for automation
```

## Troubleshooting

### "Project not linked"
- Run: `supabase link --project-ref your-project-ref`
- Or use the setup script which handles this

### "Schema application failed"
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Or apply schema manually via SQL Editor

### "Missing credentials"
- Get keys from: Supabase Dashboard → Settings → API
- Add to `.env.local`

## Next Steps After Setup

1. **Create Admin User**
   - Sign up at `/auth/signup`
   - In Supabase → `users` table → change `role` to `'admin'`

2. **Create Invite Codes**
   ```sql
   INSERT INTO invite_codes (code, role, created_by, expires_at)
   VALUES ('COHORT2024', 'cohort', 'your-admin-id', '2025-12-31'::timestamp);
   ```

3. **Add Test Partners**
   - Use partner application form
   - Or add directly in Supabase

## Consistency Benefits

✅ **Same setup every time** - Script ensures identical configuration
✅ **No manual steps** - Fully automated when service key provided
✅ **Error handling** - Clear messages if something fails
✅ **Reproducible** - Can run on any machine
