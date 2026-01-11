# Stakeholder Testing Guide - Five Tiers Connect

Welcome! This guide will help you explore and test Five Tiers Connect. Whether you're a community member, partner, administrator, or just curious, this guide will walk you through everything.

## 🚀 Quick Start (5 Minutes)

### Step 1: Access the App
1. Navigate to: `http://localhost:3000` (if running locally) or your deployed URL
2. You'll see the landing page with a "Beta Testing Mode" button

### Step 2: Enable Beta Testing Mode
1. Click **"Beta Testing Mode"** button (or go to `/dev-mode`)
2. Click **"Enable Admin Access"** - this gives you admin privileges to test everything
3. You'll be redirected to the dashboard

### Step 3: Seed Test Data (Optional)
1. On the Beta Testing Mode page, click **"Run Seed Script"**
2. This creates test businesses, users, and invite codes
3. Or manually add data in Supabase dashboard

**You're ready to explore!** 🎉

---

## 👥 Testing by User Role

### Community User Testing

#### What You Can Do:
- Browse partner directory
- Search and filter partners
- View partner details
- Book appointments
- Call partners
- Get directions
- Share partners

#### Step-by-Step Test Flow:

**1. Browse Partners**
- Go to Dashboard → "Find Partners"
- See list of all active partners
- Notice search bar at top
- See filter buttons: All, Barbershops, Salons

**2. Search Partners**
- Type in search box (e.g., "Philly" or "215")
- Results filter in real-time
- Clear search with X button

**3. Filter by Type**
- Click "Barbershops" - see only barbershops
- Click "Salons" - see only salons
- Click "All" - see everything
- Notice counts in parentheses

**4. View Partner Details**
- Click any partner card or "View Details"
- See full information:
  - Complete hours
  - Contact info (phone, email, address)
  - Youth-friendly badge (if applicable)
- Try quick actions:
  - **Call** - Opens phone dialer
  - **Book** - Opens booking form
  - **Directions** - Opens maps
  - **Share** - Shares partner link

**5. Book an Appointment**
- From partner list or detail page, click "Book Appointment"
- Booking form opens with partner pre-selected
- Choose date (calendar picker)
- Choose time
- Add service type (optional)
- Add notes (optional)
- Click "Book Appointment"
- See confirmation
- View in Dashboard → "My Schedule"

**6. Test Mobile Experience**
- Open on phone or resize browser
- Notice:
  - Large touch targets (easy to tap)
  - Single column layout
  - Search bar stays accessible
  - All buttons are 44px+ (thumb-friendly)

---

### Cohort Member Testing

#### What You Can Do:
- Enroll with invite code
- View vouchers
- Use vouchers for booking
- Request check-ins
- Manage trusted contacts
- View attendance streak
- Access crisis support

#### Step-by-Step Test Flow:

**1. Sign Up as Cohort Member**
- Go to `/auth/signup`
- Fill in email, password, name
- Select "Cohort Member"
- Enter invite code (get from admin or seed data)
- Acknowledge privacy consent
- Sign up

**2. View Dashboard**
- Notice cohort-specific features:
  - Vouchers section
  - Check-In Requests
  - Trusted Contacts
  - Attendance Streak

**3. View Vouchers**
- Go to Dashboard → "My Vouchers"
- See active vouchers with:
  - Amount
  - Business name
  - Expiration date
  - Status

**4. Use Voucher for Booking**
- Go to Schedule → "Book Appointment"
- Select a business
- Notice voucher dropdown
- Select a voucher
- Complete booking
- Voucher marked as "used"

**5. Request Check-In**
- Go to Dashboard → "Request Check-In"
- Fill in notes about what you need
- Submit request
- See confirmation

**6. Manage Trusted Contacts**
- Go to Dashboard → "Trusted Contacts"
- Click "Add Contact"
- Fill in:
  - Name
  - Relationship
  - Phone
  - Email (optional)
  - Set as primary (optional)
- Save
- Edit or delete contacts as needed

**7. Access Crisis Support**
- Go to Dashboard → "Crisis Support"
- See emergency options:
  - 911 (emergency)
  - 988 (suicide prevention)
  - Crisis Text Line
  - Request Five Tiers Check-In
- All buttons are large and clear

---

### Partner Testing

#### What You Can Do:
- Apply to become a partner
- View your business profile
- View appointments for your business

#### Step-by-Step Test Flow:

**1. Apply as Partner**
- Go to `/partner-apply` or Dashboard → "Apply as Partner"
- Fill in application:
  - Business name
  - Type (barbershop/salon)
  - Owner name, email, phone
  - Full address
- Submit
- See confirmation

**2. View Business Profile**
- After approval (admin must approve in database)
- View your business in partner directory
- Verify all information is correct

**3. View Appointments**
- Go to Dashboard → "My Schedule"
- See appointments for your business
- View customer details, date, time, service type

---

### Admin Testing

#### What You Can Do:
- View analytics dashboard
- See all users and appointments
- Create invite codes
- Review partner applications

#### Step-by-Step Test Flow:

**1. View Analytics**
- Go to Dashboard → "Analytics"
- See key metrics:
  - Total users
  - Appointments booked
  - Cohort engagement
  - Crisis requests
  - Partner statistics

**2. Create Invite Codes**
- In Supabase Dashboard → SQL Editor, run:
```sql
INSERT INTO invite_codes (code, role, created_by, expires_at)
VALUES ('TESTCODE123', 'cohort', 'your-admin-user-id', '2025-12-31'::timestamp);
```

**3. Review Partner Applications**
- In Supabase Dashboard → Table Editor → `partner_applications`
- View pending applications
- Approve by updating status to 'approved'
- Then create business record

---

## 🧪 Test Scenarios

### Scenario 1: First-Time User Journey
1. Land on homepage
2. Click "Beta Testing Mode"
3. Enable admin access
4. Explore dashboard
5. Browse partners
6. Book first appointment
7. View appointment in schedule

**Expected:** Smooth, intuitive flow with clear feedback at each step

---

### Scenario 2: Mobile User Experience
1. Open on phone (or resize browser to mobile width)
2. Browse partners
3. Search for a partner
4. View partner details
5. Book appointment
6. Test all touch interactions

**Expected:** 
- All buttons easy to tap (44px+)
- No horizontal scrolling
- Search works smoothly
- Forms are mobile-friendly

---

### Scenario 3: Offline Resilience
1. Load partners page (with network)
2. Disable network (airplane mode)
3. Reload page
4. Observe cached data

**Expected:**
- Partners list still visible
- Yellow warning: "Showing cached partners..."
- Retry button available

---

### Scenario 4: Error Handling
1. Try to access partner that doesn't exist
2. Try to book with invalid data
3. Try to use expired voucher

**Expected:**
- Clear error messages
- No crashes
- Recovery options available

---

### Scenario 5: Share Functionality
1. Open partner detail page
2. Click share button
3. Test on mobile (native share)
4. Test on desktop (clipboard)

**Expected:**
- Mobile: Native share sheet opens
- Desktop: Link copied to clipboard
- Success message appears
- Message auto-dismisses after 3 seconds

---

## 📋 Testing Checklist

### Core Features
- [ ] Can sign up as community user
- [ ] Can sign up as cohort member (with invite code)
- [ ] Can sign up as partner
- [ ] Can browse partners
- [ ] Can search partners
- [ ] Can filter partners
- [ ] Can view partner details
- [ ] Can book appointment
- [ ] Can view appointments
- [ ] Can call partner
- [ ] Can get directions
- [ ] Can share partner

### Cohort Features
- [ ] Can view vouchers
- [ ] Can use voucher for booking
- [ ] Can request check-in
- [ ] Can manage trusted contacts
- [ ] Can view attendance streak
- [ ] Can access crisis support

### Partner Features
- [ ] Can apply as partner
- [ ] Can view business profile
- [ ] Can view appointments

### Admin Features
- [ ] Can view analytics
- [ ] Can create invite codes (via database)
- [ ] Can review applications (via database)

### Mobile Experience
- [ ] All buttons are 44px+
- [ ] No horizontal scrolling
- [ ] Search works smoothly
- [ ] Forms are mobile-friendly
- [ ] Touch targets are easy to hit

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid data shows clear errors
- [ ] Empty states are friendly
- [ ] No crashes or blank screens

---

## 🐛 Reporting Issues

If you find issues or have feedback:

1. **Note the steps to reproduce**
   - What were you trying to do?
   - What happened?
   - What did you expect?

2. **Include details:**
   - Browser/device
   - User role
   - Screenshots (if helpful)

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Include error messages

---

## 💡 Tips for Testing

### Use Beta Testing Mode
- Enables admin access instantly
- No need to manually change roles in database
- Quick way to test all features

### Seed Test Data
- Creates realistic test data
- Includes businesses, users, invite codes
- Makes testing more realistic

### Test on Mobile
- Use phone or browser DevTools mobile view
- Test touch interactions
- Verify responsive design

### Test Different Roles
- Sign up as different user types
- Test role-specific features
- Verify access control

---

## 🎯 What to Focus On

### For Product Stakeholders:
- **User Experience:** Is it intuitive?
- **Feature Completeness:** Does it do what you need?
- **Mobile Experience:** Does it work on phones?
- **Low-Tech Friendliness:** Is it easy for non-tech users?

### For Technical Stakeholders:
- **Performance:** Is it fast?
- **Error Handling:** Are errors handled well?
- **Code Quality:** Is it maintainable?
- **Security:** Are permissions correct?

### For Community Stakeholders:
- **Ease of Use:** Can I use it without help?
- **Clarity:** Do I understand what to do?
- **Trust:** Does it feel safe and reliable?
- **Accessibility:** Can I use it on my device?

---

## 📚 Additional Resources

- **README.md** - Project overview and setup
- **USER_STORIES.md** - Complete user stories
- **docs/PARTNER_DIRECTORY.md** - Partner directory documentation
- **IMPLEMENTATION_NOTES.md** - What's built vs. what's not
- **NEXT_STEPS.md** - Setup and deployment guide

---

## ✅ Success Criteria

The app is ready for stakeholders when:

- ✅ All user roles can complete their primary tasks
- ✅ Mobile experience is smooth and intuitive
- ✅ Error states are handled gracefully
- ✅ No critical bugs or crashes
- ✅ Documentation is clear and helpful

**Current Status:** ✅ Ready for stakeholder testing!

---

**Last Updated:** 2025-01-27  
**Version:** 1.0.0
