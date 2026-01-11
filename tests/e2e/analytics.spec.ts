import { test, expect } from './fixtures'

test.describe('Analytics surface', () => {
  test('renders analytics dashboard', async ({ page, openDashboard }) => {
    await openDashboard('/dashboard/analytics')

    const heading = page.getByRole('heading', { name: /analytics|overview/i }).first()
    if (await heading.count()) {
      await expect(heading).toBeVisible()
    } else {
      await expect(page.locator('h1').first()).toBeVisible()
    }

    // Expect some cards or metrics to be present
    const cards = page.locator('.card, [class*="card"]')
    if (await cards.count()) {
      await expect(cards.first()).toBeVisible()
    }
  })
})
