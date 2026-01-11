import { test, expect } from './fixtures'
import { selectors } from './utils/selectors'

const routes = [
  { path: '/dashboard', label: /dashboard|home/i },
  { path: '/dashboard/partners', label: /partner/i },
  { path: '/dashboard/schedule', label: /schedule|appointment/i },
  { path: '/dashboard/contacts', label: /contact|team/i, optional: true },
  { path: '/dashboard/vouchers', label: /voucher|credit/i, optional: true },
  { path: '/dashboard/check-in', label: /check-in|support/i, optional: true },
  { path: '/dashboard/crisis', label: /crisis|help|support/i, optional: true },
  { path: '/dashboard/analytics', label: /analytics|overview|roadmap/i, optional: true },
]

test.describe('Navigation smoke', () => {
  test('loads core dashboard routes', async ({ page, openDashboard }) => {
    for (const route of routes) {
      await openDashboard(route.path)
      await page.waitForURL(new RegExp(route.path.replace(/\//g, '\\/')), { timeout: 15000 })

      const heading = page.locator('h1').first()
      if (await heading.count()) {
        await expect(heading).toBeVisible()
      } else {
        // Fallback: ensure body rendered
        await expect(page.locator('body')).toBeVisible()
      }

      // Optional label check (non-fatal)
      if (route.label) {
        const anyHeading = page.getByRole('heading', { name: route.label }).first()
        if (await anyHeading.count()) {
          await expect(anyHeading).toBeVisible()
        }
      }
    }
  })
})
