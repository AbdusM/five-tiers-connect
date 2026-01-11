# Supabase CLI Setup Guide

## Quick Setup (2 options)

### Option 1: Link to Existing Supabase Project

If you already have a Supabase project:

```bash
cd five-tiers-connect
supabase link --project-ref your-project-ref
```

Get your project ref from: https://supabase.com/dashboard/project/_/settings/general

### Option 2: Create New Project via CLI

```bash
# Login to Supabase
supabase login

# Create new project (requires Supabase account)
supabase projects create five-tiers-connect --org-id your-org-id

# Link to it
supabase link --project-ref your-project-ref
```

## Push Schema to Database

Once linked, push the schema:

```bash
# Push all migrations
supabase db push

# Or apply specific migration
supabase migration up
```

## Get Environment Variables

After linking, get your credentials:

```bash
# This will show your project URL and keys
supabase status

# Or get them from dashboard:
# https://supabase.com/dashboard/project/_/settings/api
```

Then create `.env.local`:
```bash
echo "NEXT_PUBLIC_SUPABASE_URL=your-url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local
```

## Local Development (Optional)

You can also run Supabase locally:

```bash
# Start local Supabase
supabase start

# This gives you local URLs for development
# Check output for local API URL and keys
```

## Useful Commands

```bash
# Check connection status
supabase status

# View database in browser
supabase db diff

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# Reset database (careful!)
supabase db reset
```

## Next Steps

1. Link to your project: `supabase link`
2. Push schema: `supabase db push`
3. Get credentials: `supabase status` or from dashboard
4. Add to `.env.local`
5. Run app: `npm run dev`
