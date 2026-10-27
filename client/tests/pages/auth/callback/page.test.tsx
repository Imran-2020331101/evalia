// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { router, setNav } from '@/tests/helpers/navMock'
import Page from '@/app/auth/callback/page'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => vi.useRealTimers())

describe('OAuth callback page', () => {
  it('stores the token, shows success, then toggles role modal and goes to workspace', () => {
    setNav({ search: 'token=abc.def' })
    const { store } = renderWithProviders(<Page />)
    expect(localStorage.getItem('authToken')).toBe('abc.def')
    expect(screen.getByText('Authentication successful!')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(router.push).toHaveBeenCalledWith('/workspace')
    expect(store.getState().utils.isShowAuthRole).toBe(true)
  })

  it('shows failure without a token and retries to login', () => {
    renderWithProviders(<Page />)
    expect(screen.getByText('Authentication failed!')).toBeInTheDocument()
    expect(localStorage.getItem('authToken')).toBeNull()
    screen.getByRole('button', { name: 'Try Again' }).click()
    expect(router.push).toHaveBeenCalledWith('/auth/login')
  })

  it('shows an error if storing the token throws', () => {
    setNav({ search: 'token=t' })
    const orig = localStorage.setItem
    localStorage.setItem = () => { throw new Error('quota') }
    renderWithProviders(<Page />)
    localStorage.setItem = orig
    expect(screen.getByText('Authentication failed!')).toBeInTheDocument()
  })
})
