# QA Test Mapping (Test Mode)

Environment: Local Test Mode (auth bypass). Auth-gated behaviors are noted for future coverage; primary goal is fast navigation and UI/UX validation.

## Suite Names
- `nav-smoke`
- `partners-core`
- `booking-ui`
- `cohort-ui`
- `analytics`
- `dev-mode-docs`
- `a11y-axe`
- `perf-error`

## Community Stories → Coverage
- CS-001 Browse Directory → `partners-core` (P0)
- CS-002 Search Partners → `partners-core` (P0)
- CS-003 Filter Partners → `partners-core` (P0)
- CS-004 View Partner Details → `partners-core` (P0)
- CS-005 Book Appointment → `booking-ui` (P1, UI only; submits guarded)
- CS-006 Call Partner → `partners-core` (P1 link assertions)
- CS-007 Get Directions → `partners-core` (P1 link assertions)
- CS-008 Share Partner → `partners-core` (P1 share UI + clipboard fallback)

## Cohort Stories → Coverage
- CM-001 Enroll with Invite Code → Manual/auth suite later; note in `cohort-ui` preconditions
- CM-002 View Vouchers → `cohort-ui` (P1 read-only in Test Mode)
- CM-003 Use Voucher in Booking → `booking-ui` (P1 path with seeded voucher when available; note auth required to persist)
- CM-004 Request Check-In → `cohort-ui` (P1 form UI; submission guarded without auth)
- CM-005 Manage Trusted Contacts → `cohort-ui` (P1 UI paths; CRUD guarded without auth)
- CM-006 View Attendance Streak → `cohort-ui` (P1 read surface; data may be empty in Test Mode)
- CM-007 Crisis Support Links → `cohort-ui` (P1; link targets asserted)

## Partner Stories → Coverage
- PS-001 Apply as Partner (public) → Manual pass; not primary in Test Mode
- PS-002 Partner Profile → `partners-core` (P1 read)
- PS-003 View Appointments → Manual/auth suite later

## Admin Stories → Coverage
- AD-001 Analytics Overview → `analytics` (P2 render checks)
- AD-002 Manage Invite Codes → Manual/auth suite later
- AD-003 Review Partner Applications → Manual/auth suite later

## Cross-Role & Non-Functional
- CR-001 Dev Mode Access → `dev-mode-docs` (P2)
- CR-002 Documentation Links → `dev-mode-docs` (P2)
- NF-001 Accessibility (ARIA/keyboard) → `a11y-axe` (P3 + manual spot)
- NF-002 Performance (directory/detail) → `perf-error` (P3 Lighthouse/localStorage sanity)
- NF-003 Error Handling (network/empty) → `perf-error` (P3 via route mocking)

## Notes
- Auth-required mutations remain guarded in Test Mode; automation asserts guard messaging and disabled submits.
- Where seeded data is absent, tests assert empty-state UX rather than data mutations.
- Future auth-enabled suite can reuse selectors/helpers from this mapping.
