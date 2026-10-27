import { test, expect } from '../fixtures'

test.describe('support', () => {
  test('support page shows contact options and FAQ categories', async ({ candidate: page }) => {
    await page.goto('/profile/support')
    await expect(page.getByText('Contact Us')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('evalia.apostrophe@gmail.com')).toBeVisible()
    await expect(page.getByText('All systems operational')).toBeVisible()
    await expect(page.getByText('Account & Login')).toBeVisible()
    await expect(page.getByText('Billing & Subscription')).toBeVisible()
  })

  test('recruitment guideline page loads', async ({ candidate: page }) => {
    await page.goto('/profile/recruitment&guideline')
    await expect(page.getByText('Recruitment Guideline').first()).toBeVisible({ timeout: 60_000 })
  })
})
