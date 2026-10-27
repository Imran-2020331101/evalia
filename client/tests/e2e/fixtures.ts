import { test as base, expect, type Page } from '@playwright/test'

export type Role = 'candidate' | 'recruiter'

const EMAIL: Record<Role, string> = {
  candidate: 'candidate@demo.evalia.app',
  recruiter: 'recruiter@demo.evalia.app',
}

/** Sign in through the demo login endpoint (cookies land in the browser context) and flag the SPA as signed in. */
export async function loginAs(page: Page, role: Role) {
  const res = await page.request.post('/api/auth/login', { data: { email: EMAIL[role], password: 'demo' } })
  expect(res.ok()).toBeTruthy()
  await page.addInitScript(() => localStorage.setItem('isSignedIn', JSON.stringify(true)))
}

/** Sign in through the login page "Demo as ..." buttons. */
export async function loginViaUi(page: Page, role: Role) {
  await page.goto('/auth/login')
  await page.getByRole('button', { name: role === 'candidate' ? 'Demo as Candidate' : 'Demo as Recruiter' }).click()
  await page.waitForURL('**/workspace**')
}

export const test = base.extend<{ candidate: Page; recruiter: Page }>({
  // The dev server hydrates lazily; wait for the network to settle after each navigation so clicks are not lost.
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page)
    page.goto = (async (url: string, opts?: any) => {
      const res = await goto(url, { waitUntil: 'load', timeout: 120_000, ...opts })
      await page.waitForLoadState('networkidle').catch(() => {})
      return res
    }) as typeof page.goto
    await use(page)
  },
  candidate: async ({ page }, use) => {
    await loginAs(page, 'candidate')
    await use(page)
  },
  recruiter: async ({ page }, use) => {
    await loginAs(page, 'recruiter')
    await use(page)
  },
})

export { expect }
