// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { router, setNav } from '@/tests/helpers/navMock'
import Page from '@/app/auth/verify-otp/page'

const respond = (body: any) => vi.fn(async () => ({ json: async () => body }))
beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}) })
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('VerifyOTPPage', () => {
  it('asks to register again when email is missing', () => {
    renderWithProviders(<Page />)
    expect(screen.getByText('Email not found. Please try registering again.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go back to Registration' })).toHaveAttribute('href', '/auth/register')
  })

  it('shows the email, optional message and countdown on the resend button', () => {
    setNav({ search: 'email=a@b.co&message=Check%20mail' })
    renderWithProviders(<Page />)
    expect(screen.getByText('a@b.co')).toBeInTheDocument()
    expect(screen.getByText('Check mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resend OTP in 60s' })).toBeDisabled()
  })

  it('counts down and enables resend', () => {
    vi.useFakeTimers()
    setNav({ search: 'email=a@b.co' })
    renderWithProviders(<Page />)
    for (let i = 0; i < 60; i++) act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.getByRole('button', { name: 'Resend OTP' })).toBeEnabled()
  })

  it('only accepts up to 4 digits', async () => {
    setNav({ search: 'email=a@b.co' })
    renderWithProviders(<Page />)
    const input = screen.getByLabelText('Enter 4-digit OTP')
    await userEvent.type(input, 'a1b2c3d4e5')
    expect(input).toHaveValue('1234')
  })

  it('validates empty and short otp', async () => {
    setNav({ search: 'email=a@b.co' })
    renderWithProviders(<Page />)
    await userEvent.click(screen.getByRole('button', { name: 'Verify OTP' }))
    expect(screen.getByText('Please enter the OTP')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Enter 4-digit OTP'), '12')
    expect(screen.queryByText('Please enter the OTP')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Verify OTP' }))
    expect(screen.getByText('OTP must be 4 digits')).toBeInTheDocument()
  })

  it('verifies and redirects to login after 2s', async () => {
    const f = respond({ success: true })
    vi.stubGlobal('fetch', f)
    setNav({ search: 'email=a@b.co' })
    renderWithProviders(<Page />)
    await userEvent.type(screen.getByLabelText('Enter 4-digit OTP'), '1234')
    await userEvent.click(screen.getByRole('button', { name: 'Verify OTP' }))
    expect(await screen.findByText(/Email verified successfully/)).toBeInTheDocument()
    expect(f).toHaveBeenCalledWith('/api/auth/verify-otp', expect.objectContaining({ body: JSON.stringify({ email: 'a@b.co', otp: '1234' }) }))
    expect(screen.getByRole('button', { name: 'Verify OTP' })).toBeDisabled()
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/auth/login'), { timeout: 3000 })
  })

  it('shows server error, default error, and thrown error', async () => {
    setNav({ search: 'email=a@b.co' })
    renderWithProviders(<Page />)
    const input = screen.getByLabelText('Enter 4-digit OTP')
    await userEvent.type(input, '1234')
    vi.stubGlobal('fetch', respond({ success: false, message: 'Wrong code' }))
    await userEvent.click(screen.getByRole('button', { name: 'Verify OTP' }))
    expect(await screen.findByText('Wrong code')).toBeInTheDocument()
    vi.stubGlobal('fetch', respond({ success: false }))
    await userEvent.click(screen.getByRole('button', { name: 'Verify OTP' }))
    expect(await screen.findByText('Invalid OTP. Please try again.')).toBeInTheDocument()
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('x') }))
    await userEvent.click(screen.getByRole('button', { name: 'Verify OTP' }))
    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
  })

  describe('resend', () => {
    async function ready() {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      setNav({ search: 'email=a@b.co' })
      renderWithProviders(<Page />)
      for (let i = 0; i < 60; i++) act(() => { vi.advanceTimersByTime(1000) })
    }
    it('resends and restarts the countdown', async () => {
      const f = respond({ success: true })
      vi.stubGlobal('fetch', f)
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Resend OTP' }))
      expect(await screen.findByText('OTP has been resent to your email!')).toBeInTheDocument()
      expect(f).toHaveBeenCalledWith('/api/auth/resend-otp', expect.objectContaining({ body: JSON.stringify({ email: 'a@b.co' }) }))
      expect(screen.getByRole('button', { name: 'Resend OTP in 60s' })).toBeInTheDocument()
    })
    it('reports failures', async () => {
      vi.stubGlobal('fetch', respond({ success: false }))
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Resend OTP' }))
      expect(await screen.findByText('Failed to resend OTP. Please try again.')).toBeInTheDocument()
    })
    it('reports thrown errors', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('x') }))
      await ready()
      await userEvent.click(screen.getByRole('button', { name: 'Resend OTP' }))
      expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })
  })
})
