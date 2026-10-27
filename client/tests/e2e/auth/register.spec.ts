import { test, expect } from '../fixtures'

test.describe('register', () => {
  test('renders the registration form', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('link', { name: /Sign in/ })).toHaveAttribute('href', '/auth/login')
  })

  test('validates password length', async ({ page }) => {
    await page.goto('/auth/register')
    await page.locator('#name').fill('Test User')
    await page.locator('#email').fill('test@example.com')
    await page.locator('#password').fill('123')
    await page.locator('form button[type="submit"]').click()
    await expect(page.getByText('Password must be at least 6 characters long')).toBeVisible()
  })

  test('valid details open the role selection step', async ({ page }) => {
    await page.goto('/auth/register')
    await page.locator('#name').fill('Test User')
    await page.locator('#email').fill('test@example.com')
    await page.locator('#password').fill('secret123')
    await page.locator('form button[type="submit"]').click()
    await expect(page.getByText('Choose Your Role')).toBeVisible()
    await expect(page.getByRole('radio')).toHaveCount(2)
  })
})
