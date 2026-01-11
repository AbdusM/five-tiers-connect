import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT || '3000'
const HOST = process.env.HOST || '0.0.0.0'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: `HOST=${HOST} PORT=${PORT} npm run dev`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
})
