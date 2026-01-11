import { test, expect } from './fixtures'

test.describe('Booking UI (Test Mode)', () => {
  test('dialog opens and validation states are present', async ({ page, openDashboard }) => {
    await openDashboard('/dashboard/schedule')

    await expect(page.getByRole('heading', { name: /schedule appointment/i })).toBeVisible()

    const bookButton = page.getByRole('button', { name: /book appointment/i }).first()
    await bookButton.click()

    await expect(page.getByRole('heading', { name: /book new appointment/i })).toBeVisible()

    // Ensure required fields are visible
    await expect(page.getByText(/Select Partner/i)).toBeVisible()
    await expect(page.getByText(/Select Date/i)).toBeVisible()
    await expect(page.getByText(/Select Time/i)).toBeVisible()

    // Confirm button should be disabled until required fields are set
    const confirmButton = page.getByRole('button', { name: /confirm appointment/i })
    await expect(confirmButton).toBeDisabled()

    // Optional: select available partner and time if present to ensure controls work
    const partnerTrigger = page.getByRole('button', { name: /choose a business/i }).first()
    if (await partnerTrigger.count()) {
      await partnerTrigger.click()
      const firstOption = page.getByRole('option').first()
      if (await firstOption.count()) {
        await firstOption.click()
      }
    }

    const timeTrigger = page.getByRole('button', { name: /choose a time/i }).first()
    if (await timeTrigger.count()) {
      await timeTrigger.click()
      const firstTime = page.getByRole('option').first()
      if (await firstTime.count()) {
        await firstTime.click()
      }
    }

    // Leave date unset to avoid persistent state; dialog should stay stable
    await expect(confirmButton).toBeVisible()
  })
})
