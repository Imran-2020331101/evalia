import { test, expect } from '../fixtures'

test.describe('candidate jobs', () => {
  test('explore lists active jobs', async ({ candidate: page }) => {
    await page.goto('/workspace/jobs/explore')
    await expect(page.getByText('Senior Full-Stack Engineer').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('Backend Engineer (Java / Spring)').first()).toBeVisible()
    await expect(page.getByText('ML Engineer - Clinical NLP').first()).toBeVisible()
  })

  test('saved tab only has saved jobs', async ({ candidate: page }) => {
    await page.goto('/workspace/jobs/saved')
    await expect(page.getByText('ML Engineer - Clinical NLP').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('Backend Engineer (Java / Spring)')).toHaveCount(0)
  })

  test('applied tab only has applied jobs', async ({ candidate: page }) => {
    await page.goto('/workspace/jobs/applied')
    await expect(page.getByText('Senior Full-Stack Engineer').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('ML Engineer - Clinical NLP')).toHaveCount(0)
  })

  test('sidebar navigation moves between job tabs', async ({ candidate: page }) => {
    await page.goto('/workspace')
    await page.getByRole('link', { name: /Applied \(1\)/ }).click()
    await page.waitForURL('**/workspace/jobs/applied', { timeout: 60_000 })
  })
})
