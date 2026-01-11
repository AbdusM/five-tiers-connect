# QA Runbook (Test Mode)

## How to Run
- Install deps: `npm install`
- Install browsers: `npx playwright install`
- Run all tests: `npm run test:e2e`
- List tests: `npm run test:e2e -- --list`
- Headed UI: `npm run test:e2e:ui`

Base URL: `http://localhost:3000` (Test Mode with auth bypass). Web server auto-starts via Playwright config (`npm run dev`, reuse if already running).

## Suites
- `nav-smoke` — dashboard route coverage
- `partners-core` — search/filter/detail/quick actions
- `booking-ui` — booking dialog UX (guarded without auth)
- `cohort-ui` — vouchers/check-in/contacts surfaces
- `analytics` — analytics render smoke
- `dev-mode-docs` — doc links and testing resources
- `a11y-axe` — axe scan on partner directory
- `perf-error` — cached partners fallback on network failure

## Exit Criteria
- 0 P0/P1 failures.
- Serious/critical axe violations: none.
- Cache fallback validated for partners.
- All user stories mapped in `QA_TEST_MAPPING.md` have at least one passing manual or automated check.

## Run Log Template
| Date | Env | Commit | Suite | Result | Notes |
| ---- | --- | ------ | ----- | ------ | ----- |
| 2025-01-27 | local test-mode | abc123 | nav-smoke | ✅ |  |
| 2025-01-27 | local test-mode | abc123 | partners-core | ✅ |  |
| 2025-01-27 | local test-mode | abc123 | booking-ui | ✅ |  |
| 2025-01-27 | local test-mode | abc123 | cohort-ui | ✅ |  |
| 2025-01-27 | local test-mode | abc123 | analytics | ✅ |  |
| 2025-01-27 | local test-mode | abc123 | dev-mode-docs | ✅ |  |
| 2025-01-27 | local test-mode | abc123 | a11y-axe | ✅ |  |
| 2025-01-27 | local test-mode | abc123 | perf-error | ✅ |  |

## Notes
- Test Mode keeps auth disabled; auth-required mutations remain guarded. Assertions focus on UX, navigation, and guard messaging.
- Seed data optional. If Supabase unavailable, partners use cached data (see `perf-error` test).
- For crisis/admin flows removed or not present, nav test marks them optional to avoid blocking.
