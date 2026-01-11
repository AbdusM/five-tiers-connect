# Systematic Setup Guide

## 🎯 One-Command Setup

```bash
npm run setup
```

This comprehensive script handles **everything** systematically:

1. ✅ Checks Supabase CLI installation
2. ✅ Verifies project is linked
3. ✅ Sets up environment variables (.env.local)
4. ✅ Applies database schema automatically
5. ✅ Provides clear next steps

## 📋 What It Does (Step by Step)

### Step 1: Prerequisites Check
- Verifies Supabase CLI is installed
- Checks if project is linked
- Provides clear error messages if something is missing

### Step 2: Environment Configuration
- Reads existing `.env.local` if present
- Prompts only for missing variables
- Auto-fills project URL from linked project
- Creates/updates `.env.local` file

### Step 3: Schema Application
- Attempts automatic schema application via Management API
- Falls back gracefully if service key not available
- Provides clear instructions for manual application if needed

### Step 4: Verification & Next Steps
- Shows summary of what was configured
- Lists any remaining manual steps
- Provides direct links to Supabase dashboard

## 🔄 Idempotent Design

The setup is **idempotent** - you can run it multiple times safely:

- ✅ Skips steps that are already complete
- ✅ Only prompts for missing information
- ✅ Never overwrites existing working configuration
- ✅ Can be run on any machine with same results

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Run setup (interactive)
npm run setup

# Follow prompts:
# - Enter API keys when asked
# - Service role key is optional (enables full automation)

# 2. Start development
npm run dev
```

### Subsequent Runs

If `.env.local` already exists with all keys:

```bash
npm run setup
# Will detect existing config and skip prompts
```

## 🔑 Getting API Keys

1. Go to: https://supabase.com/dashboard/project/tavalvqcebosfxamuvlx/settings/api
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (optional, for automation)

## 📦 Environment Variables

The setup creates `.env.local` with:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://tavalvqcebosfxamuvlx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional (enables automated schema application)
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## 🎯 Automation Levels

### Level 1: Basic (No Service Key)
- ✅ Environment setup
- ⚠️  Manual schema application needed
- ✅ Clear instructions provided

### Level 2: Full (With Service Key)
- ✅ Environment setup
- ✅ Automatic schema application
- ✅ Zero manual steps

## 🔧 Troubleshooting

### "Supabase CLI not found"
```bash
brew install supabase/tap/supabase
# or
npm install -g supabase
```

### "Project not linked"
```bash
supabase link --project-ref tavalvqcebosfxamuvlx
```

### "Schema application failed"
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Or apply schema manually via SQL Editor
- Link provided in output

## 📊 Systematic Benefits

✅ **Consistent** - Same setup process every time
✅ **Comprehensive** - Handles all setup steps
✅ **Safe** - Never breaks existing configuration
✅ **Clear** - Provides feedback at every step
✅ **Automated** - Minimal manual intervention needed
✅ **Reproducible** - Works identically on any machine

## 🎓 Understanding the System

The setup follows a systematic approach:

1. **Check** - Verify prerequisites
2. **Configure** - Set up environment
3. **Apply** - Deploy schema
4. **Verify** - Confirm completion
5. **Guide** - Provide next steps

Each step is independent and can be re-run safely.

## 🚀 After Setup

1. **Create Admin User**
   - Sign up at `/auth/signup`
   - In Supabase → `users` table → change `role` to `'admin'`

2. **Create Invite Codes**
   ```sql
   INSERT INTO invite_codes (code, role, created_by, expires_at)
   VALUES ('COHORT2024', 'cohort', 'your-admin-id', '2025-12-31'::timestamp);
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 📝 Files Created

- `.env.local` - Environment configuration
- `supabase/migrations/` - Database migrations
- Setup logs in console output

---

**The setup is designed to be systematic, comprehensive, and foolproof.** 🎯
