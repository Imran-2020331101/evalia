import { test, expect } from '../fixtures'

test.describe('candidate profile', () => {
  test('shows the candidate resume data', async ({ candidate: page }) => {
    await page.goto('/profile')
    await expect(page.getByText('Alex Rahman').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('candidate@demo.evalia.app')).toBeVisible()
    await expect(page.getByText('Brightwave Labs').first()).toBeVisible()
    await expect(page.getByText('Shahjalal University of Science and Technology')).toBeVisible()
  })

  test('profile sidebar links to support and guideline', async ({ candidate: page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('link', { name: /Support/ }).first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByRole('link', { name: /Recruitment Guideline/ })).toBeVisible()
  })
})
