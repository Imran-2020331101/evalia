import { test, expect } from '../fixtures'

test.describe('candidate courses', () => {
  test('explore lists suggested courses', async ({ candidate: page }) => {
    await page.goto('/workspace/courses/explore')
    await expect(page.getByText('React Tutorial for Beginners').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('System Design Basics').first()).toBeVisible()
    await expect(page.getByText('Spring Boot Full Course').first()).toBeVisible()
  })

  test('saved tab only has saved courses', async ({ candidate: page }) => {
    await page.goto('/workspace/courses/saved')
    await expect(page.getByText('React Tutorial for Beginners').first()).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('System Design Basics')).toHaveCount(0)
  })
})
