import { test, expect } from '../fixtures'

test.describe('recruiter my jobs', () => {
  test('lists the organization jobs', async ({ recruiter: page }) => {
    await page.goto('/workspace/jobs/Northwind%20Systems/my-jobs')
    await expect(page.getByText('Senior Full-Stack Engineer').first()).toBeVisible({ timeout: 90_000 })
  })

  test('job detail shows applicants workflow', async ({ recruiter: page }) => {
    await page.goto('/workspace/jobs/Northwind%20Systems/my-jobs/job-1')
    await expect(page.getByText('About the opportunity :')).toBeVisible({ timeout: 90_000 })
    await expect(page.getByText('Applicants').first()).toBeVisible()
    await expect(page.getByText('Shortlist').first()).toBeVisible()
    await expect(page.getByText('Finalist').first()).toBeVisible()
  })
})
