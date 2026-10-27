import { test, expect } from '../fixtures'

test.describe('recruiter organization', () => {
  test('profile lists the recruiter organization', async ({ recruiter: page }) => {
    await page.goto('/profile')
    await expect(page.getByText('Jordan Hayes').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('Northwind Systems').first()).toBeVisible()
    await expect(page.getByText('Cloud tooling for logistics teams.')).toBeVisible()
    await expect(page.getByText('Create A New Organization')).toBeVisible()
  })

  test('workspace sidebar shows the organization', async ({ recruiter: page }) => {
    await page.goto('/workspace')
    await expect(page.getByText('Northwind Systems').first()).toBeVisible({ timeout: 60_000 })
  })
})
