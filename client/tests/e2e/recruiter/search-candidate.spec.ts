import { test, expect } from '../fixtures'

test.describe('recruiter search candidate', () => {
  test('search page renders and enables search once text is entered', async ({ recruiter: page }) => {
    await page.goto('/workspace/search-candidate')
    await expect(page.getByText('Search candidates by job description')).toBeVisible({ timeout: 90_000 })
    const box = page.getByPlaceholder(/Looking for a senior full-stack developer/)
    const search = box.locator('xpath=following::button[1]')
    await expect(search).toBeDisabled()
    await box.fill('Senior React developer with Node.js experience')
    await expect(search).toBeEnabled()
  })
})
