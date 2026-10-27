// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { router } from '@/tests/helpers/navMock'
import LoginPage from '@/app/auth/login/page'

const flags = vi.hoisted(() => ({ demo: false }))
vi.mock('@/lib/demo/config', () => ({
  get DEMO() { return flags.demo },
  DEMO_CANDIDATE_EMAIL: 'cand@demo',
  DEMO_RECRUITER_EMAIL: 'rec@demo',
}))

async function load(demo: boolean) {
  flags.demo = demo
  return LoginPage
}
const respond = (body: any, ok = true) =>
  vi.fn(async () => ({ ok, json: async () => body }))

beforeEach(() => { localStorage.clear() })
afterEach(() => { vi.unstubAllGlobals() })

async function fill(email = 'a@b.co', pw = 'secret') {
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Password'), pw)
}

describe('LoginPage', () => {
  it('renders the form with register link and oauth links, no demo box', async () => {
    const Page = await load(false)
    render(<Page />)
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    expect(screen.getByRole('link', { name: /Create a new one/ })).toHaveAttribute('href', '/auth/register')
    expect(document.querySelector('a[href$="authorization/google"]')).toBeInTheDocument()
    expect(document.querySelector('a[href$="authorization/github"]')).toBeInTheDocument()
    expect(screen.queryByText(/live demo/)).not.toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const Page = await load(false)
    render(<Page />)
    const pw = screen.getByLabelText('Password')
    expect(pw).toHaveAttribute('type', 'password')
    // toggle button has no type attribute -> it is a submit button, but empty required fields block submit
    const toggle = pw.parentElement!.querySelector('button')!
    await userEvent.click(toggle)
    expect(pw).toHaveAttribute('type', 'text')
    await userEvent.click(toggle)
    expect(pw).toHaveAttribute('type', 'password')
  })

  it('posts credentials, marks signed in and redirects on success', async () => {
    const f = respond({ success: true })
    vi.stubGlobal('fetch', f)
    const Page = await load(false)
    render(<Page />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/workspace'))
    expect(f).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'a@b.co', password: 'secret' }) }))
    expect(localStorage.getItem('isSignedIn')).toBe('true')
  })

  it('shows the server message on failure', async () => {
    vi.stubGlobal('fetch', respond({ success: false, message: 'Bad creds' }, false))
    const Page = await load(false)
    render(<Page />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Bad creds')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('falls back to a default failure message', async () => {
    vi.stubGlobal('fetch', respond({ success: false }, false))
    const Page = await load(false)
    render(<Page />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText(/Login failed/)).toBeInTheDocument()
  })

  it('shows a generic error when the request throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('net') }))
    const Page = await load(false)
    render(<Page />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('An error occurred. Please try again.')).toBeInTheDocument()
  })

  it('shows loading state while the request is pending', async () => {
    let resolve!: (v: any) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise((r) => { resolve = r })))
    const Page = await load(false)
    render(<Page />)
    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('button', { name: 'Signing in...' })).toBeDisabled()
    resolve({ ok: true, json: async () => ({ success: true }) })
    await waitFor(() => expect(router.push).toHaveBeenCalled())
  })

  describe('demo mode', () => {
    it.each([['Demo as Candidate', 'cand@demo'], ['Demo as Recruiter', 'rec@demo']])('%s signs in with the demo account', async (label, email) => {
      const f = respond({ success: true })
      vi.stubGlobal('fetch', f)
      const Page = await load(true)
      render(<Page />)
      await userEvent.click(screen.getByRole('button', { name: label }))
      await waitFor(() => expect(router.push).toHaveBeenCalledWith('/workspace'))
      expect(JSON.parse((f.mock.calls[0] as any)[1].body)).toEqual({ email, password: 'demo' })
      expect(localStorage.getItem('isSignedIn')).toBe('true')
    })

    it('shows an error when demo sign in fails', async () => {
      vi.stubGlobal('fetch', respond({ success: false, message: 'no' }))
      const Page = await load(true)
      render(<Page />)
      await userEvent.click(screen.getByRole('button', { name: 'Demo as Candidate' }))
      expect(await screen.findByText('Demo sign-in failed. Please try again.')).toBeInTheDocument()
    })
  })
})
