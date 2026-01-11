import { test, expect } from './fixtures'
import { selectors } from './utils/selectors'

test.describe('Dev mode and docs access', () => {
  test('shows testing resources links', async ({ page }) => {
    await page.goto('/dev-mode')

    const heading = page.getByRole('heading', { name: /dev mode|beta/i }).first()
    if (await heading.count()) {
      await expect(heading).toBeVisible()
    }

    const docsCard = page.locator(selectors.devDocsCard).first()
    await expect(docsCard).toBeVisible()

    // Ensure documentation references are present
    await expect(page.getByText('STAKEHOLDER_GUIDE.md', { exact: true })).toBeVisible()
    await expect(page.getByText('USER_STORIES.md', { exact: true })).toBeVisible()
    await expect(page.getByText('QUICK_START.md', { exact: true })).toBeVisible()
  })
})
