import { test, expect } from '../fixtures'

test.describe('notifications', () => {
  test('lists notifications and unread badge', async ({ candidate: page }) => {
    await page.goto('/workspace/notifications')
    await expect(page.getByText('Interview scheduled')).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('Application received')).toBeVisible()
    await expect(page.getByText('Welcome to Evalia')).toBeVisible()
  })

  test('mark all read clears the unread badge', async ({ candidate: page }) => {
    await page.goto('/workspace/notifications')
    await expect(page.getByText('Mark All Read')).toBeVisible({ timeout: 60_000 })
    await page.getByText('Mark All Read').click()
    await expect(page.getByText('Interview scheduled')).toBeVisible()
  })

  test('demo mode does not open a websocket to the notification service', async ({ candidate: page }) => {
    const sockets: string[] = []
    page.on('websocket', (ws) => sockets.push(ws.url()))
    await page.goto('/workspace')
    await page.waitForTimeout(1500)
    expect(sockets.filter((u) => u.includes(':6001'))).toHaveLength(0)
  })
})
