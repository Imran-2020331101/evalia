// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import RoleSelection from '@/components/auth/requirements/RoleSelection'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { router } from '../../../helpers/navMock'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const setup = (userType: any = null, preloaded: any = { auth: { registerFormData: { email: 'a@b.c' } } }) => {
  const setUserType = vi.fn(), setIsNext = vi.fn()
  const utils = renderWithProviders(<RoleSelection userType={userType} setUserType={setUserType} setIsNext={setIsNext} />, { preloadedState: preloaded })
  return { setUserType, setIsNext, ...utils }
}
const mockFetch = (body: any, reject = false) => {
  const f = vi.fn(() => (reject ? Promise.reject(new Error('net')) : Promise.resolve({ json: () => Promise.resolve(body) })))
  vi.stubGlobal('fetch', f)
  return f
}
beforeEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals() })

describe('RoleSelection', () => {
  it('selecting a role updates parent and form data', async () => {
    const { setUserType, store } = setup()
    await userEvent.click(screen.getByText('Continue as Candidate'))
    expect(setUserType).toHaveBeenCalledWith('candidate')
    expect(store.getState().auth.registerFormData.role).toBe('USER')
    await userEvent.click(screen.getByText('Continue as Recruiter'))
    expect(setUserType).toHaveBeenLastCalledWith('recruiter')
    expect(store.getState().auth.registerFormData.role).toBe('RECRUITER')
  })

  it('supports keyboard selection and reflects aria-checked', () => {
    const { setUserType } = setup('recruiter')
    const [cand, rec] = screen.getAllByRole('radio')
    expect(rec).toHaveAttribute('aria-checked', 'true')
    expect(cand).toHaveAttribute('aria-checked', 'false')
    fireEvent.keyDown(cand, { key: 'Enter' })
    fireEvent.keyDown(cand, { key: ' ' })
    fireEvent.keyDown(cand, { key: 'a' })
    expect(setUserType).toHaveBeenCalledTimes(2)
  })

  it('requires a role before signing up', async () => {
    const f = mockFetch({})
    setup(null)
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(toast.error).toHaveBeenCalledWith('Please select a user type.')
    expect(f).not.toHaveBeenCalled()
  })

  it('registers and redirects to OTP verification on success', async () => {
    const f = mockFetch({ success: true })
    const { setIsNext } = setup('candidate')
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    await waitFor(() => expect(setIsNext).toHaveBeenCalledWith(true))
    expect(f).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({ method: 'POST' }))
    expect(router.push).toHaveBeenCalledWith(expect.stringContaining('/auth/verify-otp?email=a%40b.c'))
  })

  it('shows the server message and toggles the auth role modal on failure', async () => {
    mockFetch({ success: false, message: 'Email taken' })
    const { store } = setup('candidate', { auth: { registerFormData: { email: 'a@b.c' } }, utils: { isShowAuthRole: true } })
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Email taken'))
    expect(store.getState().utils.isShowAuthRole).toBe(false)
  })

  it('falls back to a generic message and handles network errors', async () => {
    mockFetch({ success: false })
    setup('candidate')
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Registration failed. Please try again.'))
    vi.clearAllMocks()
    mockFetch(null, true)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setup('candidate')
    await userEvent.click(screen.getAllByRole('button', { name: /Next/ })[1])
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Registration failed. Please try again.'))
  })
})
