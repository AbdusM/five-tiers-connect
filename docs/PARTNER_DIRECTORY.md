# Partner Directory - Feature Documentation

## Overview

The Partner Directory is a mobile-first, low-tech-optimized feature that allows users to discover, search, and book appointments with trusted barbershops and salons in Philadelphia. The feature emphasizes simplicity, accessibility, and seamless user experience.

## User Guide (Low-Tech Friendly)

### How to Find a Partner

1. **Open the Partner Directory**
   - From your dashboard, tap "Find Partners" or "Partners" in the menu
   - You'll see a list of all available partners

2. **Search for a Partner**
   - Type in the search box at the top
   - You can search by:
     - Business name (e.g., "Philly Cuts")
     - Address (e.g., "Market Street")
     - City (e.g., "Philadelphia")
     - Phone number

3. **Filter by Type**
   - Tap "Barbershops" to see only barbershops
   - Tap "Salons" to see only salons
   - Tap "All" to see everything
   - Numbers in parentheses show how many of each type

4. **View Partner Details**
   - Tap on any partner card or "View Details" button
   - See full information including hours, contact info, and location

5. **Book an Appointment**
   - Tap "Book Appointment" on any partner card or detail page
   - The booking form will open with that partner already selected
   - Choose a date and time, then confirm

6. **Call a Partner**
   - Tap the "Call" button on any partner card
   - Your phone will dial the partner's number

7. **Get Directions**
   - Tap the address on a partner card or detail page
   - Your maps app will open with directions

8. **Share a Partner**
   - On a partner detail page, tap the share button (top right)
   - Choose how to share (text message, email, etc.)
   - Or the link will be copied to your clipboard

## Data Flow

### Partner List Loading

```
User opens Partners page
  ↓
loadBusinesses() called
  ↓
Supabase query: businesses WHERE is_active = true
  ↓
Data cached in localStorage (1 hour TTL)
  ↓
Filtered by search term (debounced 300ms)
  ↓
Filtered by type (barbershop/salon)
  ↓
Rendered as cards
```

### Partner Detail Loading

```
User taps partner card
  ↓
Navigate to /dashboard/partners/[id]
  ↓
loadBusiness() called with business ID
  ↓
Supabase query: businesses WHERE id = [id] AND is_active = true
  ↓
Single business object returned
  ↓
Full details rendered
```

### Booking Flow Integration

```
User taps "Book Appointment"
  ↓
Navigate to /dashboard/schedule?business=[id]
  ↓
Schedule page reads ?business parameter
  ↓
Validates business exists in businesses list
  ↓
Pre-selects business in booking form
  ↓
Auto-opens booking dialog
  ↓
User completes booking
```

## Error States

### Network Error
**When it happens:** Internet connection lost or Supabase unavailable

**What users see:**
- Yellow warning banner: "Showing cached partners. Some information may be outdated."
- Partners list still visible (from cache)
- Retry button available

**Technical details:**
- Cache validated for structure and age (< 1 hour)
- Invalid cache automatically cleared
- Fallback to cached data if available

### Permission Error
**When it happens:** User doesn't have permission to view partners (RLS policy violation)

**What users see:**
- Red error card with message
- "Go to Dashboard" button

**Technical details:**
- Error type detected from Supabase error message
- Specific user-friendly message displayed

### Partner Not Found
**When it happens:** Partner ID invalid or partner deactivated

**What users see:**
- Error card: "Partner not found. It may have been removed or is no longer active."
- "View All Partners" and "Go Back" buttons

**Technical details:**
- Supabase error code PGRST116 indicates not found
- Graceful error handling with recovery options

### Empty States

**No Partners Available:**
- Large icon, friendly message
- "Refresh" button

**No Search Results:**
- Different message based on whether filters are active
- "Clear Filters" button if filters active

## Cache Strategy

### localStorage Structure

```typescript
{
  data: Business[],  // Array of business objects
  timestamp: number  // Unix timestamp in milliseconds
}
```

### Cache Validation

1. **Structure Check:** Verifies data is an array
2. **Age Check:** Must be < 1 hour old
3. **Field Validation:** Each business must have:
   - `id` (string)
   - `name` (string)
   - `type` (string)
   - `address` (string)
   - `is_active` (boolean)

### Cache Invalidation

- **Automatic:** After 1 hour
- **Manual:** When cache structure invalid
- **On Success:** New data replaces old cache

## Performance Optimizations

### Debounced Search
- **Delay:** 300ms
- **Benefit:** Reduces API calls and filtering operations
- **Implementation:** Custom `useDebounce` hook

### Memoized Filtering
- **Hook:** `useMemo`
- **Dependencies:** `businesses`, `filterType`, `debouncedSearchTerm`
- **Benefit:** Only recalculates when inputs change

### Skeleton Loaders
- **Purpose:** Prevent layout shift during loading
- **Implementation:** 3 placeholder cards matching final layout
- **Benefit:** Perceived performance improvement

## Accessibility Features

### ARIA Labels
- All interactive elements have descriptive `aria-label` attributes
- Icon-only buttons have clear labels
- Search input properly labeled

### Keyboard Navigation
- All buttons and links are keyboard accessible
- Focus states clearly visible
- Tab order logical

### Touch Targets
- **Minimum Size:** 44x44px (Apple HIG / WCAG)
- **Verified:** All buttons, links, and interactive elements meet requirement
- **Mobile Optimized:** Single-column layout on mobile

### Screen Reader Support
- Semantic HTML (`<button>`, `<a>`, `<nav>`)
- Icon-only elements marked with `aria-hidden="true"`
- Descriptive text for all actions

## Type Safety

### BusinessHours Type

```typescript
export interface BusinessHours {
  open: string  // Format: "HH:MM" (24-hour)
  close: string  // Format: "HH:MM" (24-hour)
}
```

**Usage:**
- `Business.hours?: Record<string, BusinessHours>`
- Validated at runtime in cache
- Type-safe throughout component tree

### Phone Number Formatting

**Input Formats Supported:**
- `"(215) 555-1234"` → Returns as-is
- `"2155551234"` → Formats to `"(215) 555-1234"`
- `"+12155551234"` → Formats to `"+1 (215) 555-1234"`
- Other formats → Returns as-is (may be international or malformed)

**Output:**
- Always returns string (empty string if input is null/undefined)
- 10-digit US numbers: `(XXX) XXX-XXXX`
- 11-digit US numbers: `+1 (XXX) XXX-XXXX`

## Component Architecture

### PartnersPage (`app/dashboard/partners/page.tsx`)
- Main list view
- Search and filter functionality
- Partner cards with key information
- Empty and error states

### PartnerDetailPage (`app/dashboard/partners/[id]/page.tsx`)
- Full partner information
- Complete hours display
- Quick actions (Call, Book, Directions, Share)
- Error handling for not found

### BusinessHours (`components/business-hours.tsx`)
- Reusable hours display component
- Handles truncation and "View all" link
- Type-safe with BusinessHours interface

### ErrorBoundary (`components/error-boundary.tsx`)
- Catches React component errors
- Graceful fallback UI
- Reset functionality

## Utility Functions

### formatPhoneNumber
**File:** `lib/utils.ts`

**Purpose:** Format phone numbers for consistent display

**Parameters:**
- `phone: string | null | undefined`

**Returns:** `string`

**Examples:**
```typescript
formatPhoneNumber("2155551234") // "(215) 555-1234"
formatPhoneNumber("(215) 555-1234") // "(215) 555-1234"
formatPhoneNumber(null) // ""
```

### getMapsUrl
**File:** `lib/utils.ts`

**Purpose:** Generate Google Maps URL for address

**Parameters:**
- `address: string`
- `city: string`
- `state: string`
- `zip: string`

**Returns:** `string` (URL-encoded Google Maps link)

**Example:**
```typescript
getMapsUrl("123 Main St", "Philadelphia", "PA", "19104")
// "https://maps.google.com/?q=123%20Main%20St%2C%20Philadelphia%2C%20PA%2019104"
```

### formatAddress
**File:** `lib/utils.ts`

**Purpose:** Combine address components into full address string

**Parameters:**
- `address: string`
- `city: string`
- `state: string`
- `zip: string`

**Returns:** `string`

**Example:**
```typescript
formatAddress("123 Main St", "Philadelphia", "PA", "19104")
// "123 Main St, Philadelphia, PA 19104"
```

## Database Schema

### businesses Table

**Key Fields:**
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `type` (TEXT, CHECK: 'barbershop' | 'salon')
- `address`, `city`, `state`, `zip` (TEXT, NOT NULL)
- `phone` (TEXT, NOT NULL)
- `email` (TEXT, Optional)
- `is_active` (BOOLEAN, DEFAULT true)
- `is_youth_friendly` (BOOLEAN, DEFAULT false)
- `hours` (JSONB, Optional) - Format: `{ "monday": { "open": "09:00", "close": "18:00" }, ... }`
- `latitude`, `longitude` (DECIMAL, Optional)

**Row Level Security:**
- Anyone can view active businesses (`is_active = true`)
- Partners can manage their own business
- Admins can manage all businesses

## Testing Checklist

### Manual Testing

- [ ] **Network Loss:** Disable network, verify cache fallback works
- [ ] **Empty Database:** No partners, verify empty state displays
- [ ] **Permission Error:** Test with restricted user, verify error message
- [ ] **Slow Device:** Test on low-end device, verify performance
- [ ] **Mobile Safari:** Test on iPhone Safari, verify all interactions
- [ ] **Mobile Chrome:** Test on Android Chrome, verify all interactions
- [ ] **Share Functionality:** Test native share and clipboard fallback
- [ ] **Preselect Booking:** Tap "Book Appointment", verify business pre-selected
- [ ] **Search:** Test various search terms, verify results
- [ ] **Filters:** Test all filter combinations, verify counts
- [ ] **Touch Targets:** Verify all buttons ≥44px on mobile
- [ ] **Screen Reader:** Test with VoiceOver/TalkBack, verify all labels
- [ ] **Keyboard Navigation:** Tab through all elements, verify focus order

### Edge Cases

- [ ] **Very Long Partner List:** 100+ partners, verify performance
- [ ] **Special Characters:** Partner names with special chars, verify display
- [ ] **Missing Hours:** Partner with no hours, verify no crash
- [ ] **Invalid Phone:** Malformed phone numbers, verify formatting
- [ ] **Cache Corruption:** Corrupt localStorage, verify auto-clear

## Troubleshooting

### Partners Not Loading

**Check:**
1. Internet connection
2. Supabase project URL and key in `.env.local`
3. Browser console for errors
4. Supabase dashboard for RLS policies

### Search Not Working

**Check:**
1. Debounce delay (should be 300ms)
2. Search term is being set correctly
3. Filter logic in `filteredBusinesses` useMemo

### Cache Issues

**Clear Cache:**
```javascript
localStorage.removeItem('partners_cache')
```

**Check Cache:**
```javascript
JSON.parse(localStorage.getItem('partners_cache'))
```

## Future Enhancements

### Not in Current Scope
- Map view integration (Google Maps/Mapbox)
- Distance calculation and sorting
- Partner reviews and ratings
- Favorite/bookmark partners
- Partner logos/images
- Advanced filtering (youth-friendly only, etc.)

### Potential Additions
- Partner search by service type
- Operating hours filtering (open now, open tomorrow)
- Partner verification badges
- Partner social media links

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies in Supabase dashboard
4. Review error messages in UI (they're user-friendly)

---

**Last Updated:** 2025-01-27  
**Version:** 1.0.0  
**Status:** Production Ready
