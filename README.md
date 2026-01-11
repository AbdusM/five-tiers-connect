# Five Tiers Connect

A community scheduling and reentry support platform connecting justice-involved youth to trusted barbershops and salons in Philadelphia.

## Features

### Core Features (Built & Functional)
- **Scheduling System**: Easy appointment booking with calendar interface
- **Partner Directory**: Searchable directory with youth-friendly badges
- **Cohort Vouchers**: Voucher system for justice-involved youth with expiration tracking
- **Crisis Routing**: Emergency support with 911, 988, and Five Tiers check-in options
- **Analytics Dashboard**: Admin dashboard for tracking outcomes and engagement
- **Role-Based Access**: Support for Community, Cohort, Partner, and Admin users

### Cohort Track Features (Protected - Built & Functional)
- **Invite Code System**: Secure enrollment via invite codes for justice-involved youth
- **Check-In Requests**: Non-emergency support request system for Five Tiers staff
- **Trusted Contacts**: Manage personal support network with primary contact designation
- **Attendance Streaks**: Progress tracking with visual indicators for engagement

### Partner Features (Built & Functional)
- **Partner Application**: Simple application form for new businesses
- **Business Profiles**: Listings with hours, services, and youth-friendly designation
- **Booking Management**: Partners can view appointments (basic - can be enhanced later)

### User Experience
- **Consent & Privacy**: Built-in privacy acknowledgment during signup
- **Large Touch Targets**: Optimized for low-tech users (44px+ buttons)
- **Clear Confirmations**: Visual feedback for all actions
- **Mobile-First Design**: Fully responsive across all devices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   cd five-tiers-connect
   npm install
   ```

2. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Go to Settings > API and copy your URL and anon key

3. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

1. In Supabase Dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the SQL script to create all tables, indexes, and policies

## User Roles

- **Community**: General users who can book appointments and browse partners
- **Cohort**: Justice-involved youth with access to vouchers, crisis support, check-ins, and trusted contacts (enrolled via invite code)
- **Partner**: Business owners who manage their listings and appointments
- **Admin**: Full access to analytics, user management, invite code generation, and partner applications

## Design Principles

This app is designed for **low-tech literate users** with:
- Large touch targets (minimum 44x44px)
- Clear visual hierarchy
- Simple navigation (max 2-3 levels deep)
- Confirmation dialogs for important actions
- Color + icon + text labels
- Mobile-first responsive design

## Project Structure

```
five-tiers-connect/
├── app/
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Main app pages
│   └── layout.tsx     # Root layout
├── components/
│   ├── ui/            # shadcn/ui components
│   └── dashboard-nav.tsx
├── lib/
│   └── supabase/      # Supabase client setup
├── types/
│   └── database.ts    # TypeScript types
└── supabase/
    └── schema.sql     # Database schema
```

## Additional Setup

### Creating Invite Codes (Admin Only)

After setting up your admin account, you can create invite codes for cohort enrollment:

```sql
INSERT INTO invite_codes (code, role, created_by, expires_at)
VALUES ('YOURCODE123', 'cohort', 'your-admin-user-id', '2025-12-31'::timestamp);
```

### Partner Application Review

Admins can review partner applications in the database and approve them:

```sql
-- Approve application
UPDATE partner_applications 
SET status = 'approved', reviewed_by = 'admin-user-id', reviewed_at = NOW()
WHERE id = 'application-id';

-- Then create the business and user account
```

## Nice-to-Have Features (Not Blockers)

These features are mentioned in the UI but not fully implemented yet. They're placeholders for future work:
- **Map View**: Partner locations on a map (UI ready, needs Google Maps/Mapbox API)
- **SMS Reminders**: Automated appointment reminders (can be added later with Twilio)
- **Phone Authentication**: Phone-based login (Supabase supports this, just not wired up yet)
- **Push Notifications**: Browser notifications (can be added later)

**Important**: None of these are required for the app to work. Everything core is built and functional.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically build and deploy on every push to main.

## Current Implementation Status

**Everything core is built and works.** See `IMPLEMENTATION_NOTES.md` for details on what's functional vs. what's placeholder.

The app is ready to use with just Supabase - no other services required.

## For Stakeholders & Testers

**New to the system?** Start here:

1. **📖 [STAKEHOLDER_GUIDE.md](STAKEHOLDER_GUIDE.md)** - Complete testing guide with step-by-step instructions for all user roles
2. **📋 [USER_STORIES.md](USER_STORIES.md)** - All user stories defined with acceptance criteria and implementation status
3. **🧪 Beta Testing Mode** - Click "Beta Testing Mode" on the homepage to enable admin access instantly

### Quick Start for Testing:
1. Navigate to homepage
2. Click "Beta Testing Mode"
3. Click "Enable Admin Access"
4. Start exploring!

All features are documented and ready for stakeholder review.

## Handoff Documentation

**For developers taking over this project:**
- **[HANDOFF_DOCUMENT.md](HANDOFF_DOCUMENT.md)** - Complete project handoff with architecture, setup, features, and next steps

## License

This project is built for community impact work in Philadelphia.
