import { test, expect } from './fixtures'
import { selectors } from './utils/selectors'

test.describe('Partner directory core flows', () => {
  test('search, filter, and detail access', async ({ page, openDashboard }) => {
    await openDashboard('/dashboard/partners')

    await expect(page.getByRole('heading', { name: /partner directory/i })).toBeVisible()

    // Search input present
    const searchInput = page.locator(selectors.partnersSearchInput)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Fresh')
    await searchInput.press('Enter')

    // Filters visible and clickable
    await expect(page.locator(selectors.partnersFilterBarbers)).toBeVisible()
    await page.locator(selectors.partnersFilterBarbers).click()
    await page.locator(selectors.partnersFilterSalons).click()

    // Expect either cards or the empty-state message (tolerate delayed loads)
    const cards = page.locator('[data-partner-card]')
    const emptyState = page.getByText(/No Partners Found|No Partners Available/i)

    if (await cards.count({ timeout: 10000 })) {
      const firstCard = cards.first()
      await expect(firstCard).toBeVisible({ timeout: 5000 })
      await expect(firstCard.locator('[data-partner-book]')).toBeVisible({ timeout: 5000 })
      await expect(firstCard.locator('[data-partner-detail-link]')).toBeVisible({ timeout: 5000 })
    } else {
      await expect(emptyState).toBeVisible({ timeout: 5000 })
    }
  })
})
