import { test, expect } from '../fixtures'

test.describe('candidate interviews', () => {
  test('all tab lists interviews with their status', async ({ candidate: page }) => {
    await page.goto('/workspace/interviews/all')
    await expect(page.getByText('SCHEDULED')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('COMPLETED')).toBeVisible()
    await expect(page.getByText('CANCELLED')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Join Interview' }).or(page.getByText('Join Interview'))).toBeVisible()
  })

  test('sidebar shows interview counts', async ({ candidate: page }) => {
    await page.goto('/workspace')
    await expect(page.getByText('All (3)')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('Completed (1)')).toBeVisible()
  })

  test('completed interview offers a summary', async ({ candidate: page }) => {
    await page.goto('/workspace/interviews/completed')
    await expect(page.getByText('View Summary')).toBeVisible({ timeout: 60_000 })
  })
})
