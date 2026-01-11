import { test as base, expect } from '@playwright/test'

type Fixtures = {
  openDashboard: (path?: string) => Promise<void>
}

export const test = base.extend<Fixtures>({
  openDashboard: async ({ page, baseURL }, use) => {
    await use(async (path = '/dashboard') => {
      const target = baseURL ? `${baseURL}${path}` : path
      await page.goto(target)
    })
  },
})

export { expect }
