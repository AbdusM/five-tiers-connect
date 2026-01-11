import { test, expect } from './fixtures'

test.describe('Resilience and cache behavior', () => {
  test('falls back to cached partners on network failure', async ({ page }) => {
    const cachedPartners = [
      {
        id: 'cache-1',
        name: 'Cached Partner',
        type: 'barbershop',
        address: '100 Cache St',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19104',
        phone: '215-555-0000',
        is_active: true,
      },
    ]

    await page.addInitScript(({ data }) => {
      try {
        localStorage.setItem('partners_cache', JSON.stringify({ data, timestamp: Date.now() }))
      } catch (e) {
        // ignore
      }
    }, { data: cachedPartners })

    // Simulate Supabase REST failure
    await page.route('**/rest/v1/businesses**', (route) => route.abort())

    await page.goto('/dashboard/partners')

    await expect(page.getByText(/Showing cached partners/i)).toBeVisible()
    await expect(page.locator('[data-partner-card]').first()).toBeVisible()
  })
})
