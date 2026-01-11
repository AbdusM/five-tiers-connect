# GitHub Authentication Setup

## ✅ Code Added

GitHub OAuth is now integrated into the app:
- Sign in page has "Sign in with GitHub" button
- Sign up page has "Sign up with GitHub" button
- OAuth callback handler creates user profile automatically

## 🔧 Supabase Configuration Required

To enable GitHub auth, you need to configure it in Supabase:

### Step 1: Enable GitHub Provider

1. Go to: https://supabase.com/dashboard/project/tavalvqcebosfxamuvlx/auth/providers
2. Find "GitHub" in the list
3. Toggle it ON

### Step 2: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Five Tiers Connect
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `https://tavalvqcebosfxamuvlx.supabase.co/auth/v1/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### Step 3: Add to Supabase

1. Back in Supabase → Auth → Providers → GitHub
2. Paste:
   - **Client ID** (from GitHub)
   - **Client Secret** (from GitHub)
3. Save

### Step 4: Update Redirect URL (Production)

When deploying, update the GitHub OAuth app callback URL to:
```
https://your-project.supabase.co/auth/v1/callback
```

## 🎯 How It Works

1. User clicks "Sign in with GitHub"
2. Redirects to GitHub for authorization
3. GitHub redirects back to `/auth/callback`
4. Supabase exchanges code for session
5. User profile is created automatically (if first time)
6. User is redirected to dashboard

## 📝 Default Behavior

- GitHub users get `role: 'community'` by default
- Can be changed to admin in Supabase → users table
- Full name is pulled from GitHub profile
- Email from GitHub account

## ✅ That's It!

Once configured in Supabase, GitHub auth will work immediately.
No code changes needed - it's all set up!
