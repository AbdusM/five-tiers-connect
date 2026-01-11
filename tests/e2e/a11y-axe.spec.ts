import AxeBuilder from '@axe-core/playwright'
import { test, expect } from './fixtures'

test.describe('Accessibility (axe)', () => {
  test('partner directory has no serious/critical violations', async ({ page, openDashboard }) => {
    await openDashboard('/dashboard/partners')

    const results = await new AxeBuilder({ page })
      .include('main')
      .exclude('iframe, video')
      .analyze()

    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    )

    expect(serious).toEqual([])
  })
})
