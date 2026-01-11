# Next Steps - Getting Five Tiers Connect Running

## 🚀 Quick Start Checklist

### 1. Set Up Supabase (5-10 minutes)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up (free tier is perfect)
   - Create a new project

2. **Run Database Schema**
   - In Supabase Dashboard → SQL Editor
   - Copy entire contents of `supabase/schema.sql`
   - Paste and run it
   - ✅ This creates all tables, indexes, and security policies

3. **Get API Keys**
   - Go to Settings → API
   - Copy:
     - Project URL
     - `anon` public key

### 2. Configure Environment (2 minutes)

1. **Create `.env.local` file**:
   ```bash
   cd five-tiers-connect
   cp .env.local.example .env.local
   ```

2. **Add your Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Run Locally (1 minute)

```bash
npm install  # if you haven't already
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Create Your First Admin User

1. **Sign up** at `/auth/signup` with any email
2. **In Supabase Dashboard** → Table Editor → `users` table
3. **Find your user** and change `role` to `'admin'`

### 5. Create Invite Codes (For Cohort Members)

In Supabase SQL Editor, run:
```sql
INSERT INTO invite_codes (code, role, created_by, expires_at)
VALUES 
  ('COHORT2024', 'cohort', 'your-admin-user-id', '2025-12-31'::timestamp),
  ('FIVETIERS1', 'cohort', 'your-admin-user-id', '2025-12-31'::timestamp);
```

Replace `'your-admin-user-id'` with your actual admin user ID from the `users` table.

### 6. Add Test Partners

In Supabase Table Editor → `businesses`, add a test business:
- `name`: "Test Barbershop"
- `type`: "barbershop"
- `address`: "123 Main St"
- `city`: "Philadelphia"
- `state`: "PA"
- `zip`: "19104"
- `phone`: "(215) 555-1234"
- `is_active`: true

## 🧪 Test the App

### Test User Flows:

1. **Community User**
   - Sign up as "Community Member"
   - Browse partners
   - Book an appointment

2. **Cohort Member**
   - Sign up with an invite code
   - Should see: Vouchers, Check-In, Crisis Support, Contacts
   - Request a check-in
   - Add trusted contacts

3. **Admin**
   - View analytics dashboard
   - See all users and appointments

## 📱 Deploy to Production

### Option 1: Vercel (Recommended - Free)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy!

### Option 2: Other Platforms

- **Netlify**: Similar to Vercel
- **Railway**: Good for full-stack
- **Render**: Simple deployment

## 🔧 Common Issues

### "Supabase client error"
- Check `.env.local` has correct values
- Restart dev server after adding env vars

### "Permission denied" errors
- Check Row Level Security (RLS) policies in Supabase
- Make sure you ran the full `schema.sql`

### "Table doesn't exist"
- Run `schema.sql` in Supabase SQL Editor
- Check all tables were created

## 📊 What to Do Next

1. **Customize Branding**
   - Update `app/layout.tsx` metadata
   - Change colors in `app/globals.css`
   - Update logo/favicon

2. **Add Real Partners**
   - Use partner application form
   - Or add directly in Supabase

3. **Set Up Email (Optional)**
   - Configure Supabase email templates
   - Set up SMTP for password resets

4. **Add SMS Reminders (Future)**
   - Integrate Twilio
   - Add to appointment booking flow

## 🎯 Success Metrics

Track these in your analytics dashboard:
- Total users
- Appointments booked
- Completion rate
- Cohort engagement
- Crisis requests

## 💡 Tips

- **Start small**: Add 2-3 test partners first
- **Test thoroughly**: Try all user roles
- **Document**: Keep notes on what works/doesn't
- **Iterate**: Add features based on real usage

---

**Ready to launch?** Follow steps 1-3 to get running locally, then deploy when ready!
