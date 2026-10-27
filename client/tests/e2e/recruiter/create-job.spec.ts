import { test, expect } from '../fixtures'

test.describe('recruiter create job', () => {
  test('form renders with a live preview', async ({ recruiter: page }) => {
    await page.goto('/workspace/jobs/Northwind%20Systems/create')
    await expect(page.getByLabel(/Job title/)).toBeVisible({ timeout: 90_000 })
    await expect(page.getByText('Job title will appear here')).toBeVisible()
    await page.getByLabel(/Job title/).fill('Staff Platform Engineer')
    await expect(page.getByText('Staff Platform Engineer').first()).toBeVisible()
  })

  test('can fill in job details and see them previewed', async ({ recruiter: page }) => {
    await page.goto('/workspace/jobs/Northwind%20Systems/create')
    await page.getByLabel(/Job description/).fill('Own our infrastructure platform.')
    await expect(page.getByText('Own our infrastructure platform.').first()).toBeVisible({ timeout: 90_000 })
  })
})
