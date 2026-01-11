import { test, expect } from './fixtures'

const cohortPages = [
  { path: '/dashboard/vouchers', heading: /voucher/i },
  { path: '/dashboard/check-in', heading: /check-?in/i },
  { path: '/dashboard/contacts', heading: /contact/i },
]

test.describe('Cohort UI surfaces', () => {
  for (const pageDef of cohortPages) {
    test(`renders ${pageDef.path}`, async ({ page, openDashboard }) => {
      await openDashboard(pageDef.path)

      const heading = page.getByRole('heading', { name: pageDef.heading }).first()
      if (await heading.count()) {
        await expect(heading).toBeVisible()
      } else {
        await expect(page.locator('h1').first()).toBeVisible()
      }

      // Ensure page is interactive (buttons or inputs present)
      const hasInput = await page.locator('input, textarea, select, button').count()
      expect(hasInput).toBeGreaterThan(0)
    })
  }
})
