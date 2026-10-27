// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('../../helpers/axiosMock'))
import HamburgerMenu from '@/components/modal/HamburgerMenu'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import { router } from '../../helpers/navMock'

const user = { user: { email: 'a@b.c' } }

describe('HamburgerMenu', () => {
  beforeEach(() => localStorage.clear())

  it('is hidden by default and visible when toggled', () => {
    const { container, store } = renderWithProviders(<HamburgerMenu />)
    expect(container.firstChild).toHaveClass('hidden')
    renderWithProviders(<HamburgerMenu />, { preloadedState: { utils: { isShowHamburgerMenu: true } } })
    expect(store).toBeDefined()
  })

  it('shows sign in / sign up when logged out and navigates', async () => {
    const { store } = renderWithProviders(<HamburgerMenu />, { preloadedState: { utils: { isShowHamburgerMenu: true } } })
    await userEvent.click(await screen.findByRole('button', { name: 'SignIN' }))
    expect(router.push).toHaveBeenCalledWith('/auth/login')
    expect(store.getState().utils.isShowHamburgerMenu).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'SignUP' }))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/auth/register'))
  })

  it('shows profile / workspace when signed in and navigates', async () => {
    localStorage.setItem('isSignedIn', 'true')
    const { store } = renderWithProviders(<HamburgerMenu />, { preloadedState: { auth: { user }, utils: { isShowHamburgerMenu: true } } })
    await waitFor(() => expect(store.getState().auth.isSignedIn).toBe(true))
    await userEvent.click(screen.getByRole('button', { name: 'Profile' }))
    expect(router.push).toHaveBeenCalledWith('/profile')
    await userEvent.click(screen.getByRole('button', { name: 'Workspace' }))
    expect(router.push).toHaveBeenCalledWith('/workspace')
    expect(screen.queryByRole('button', { name: 'SignIN' })).not.toBeInTheDocument()
  })

  it('close button toggles menu off', async () => {
    const { store } = renderWithProviders(<HamburgerMenu />, { preloadedState: { auth: { user }, utils: { isShowHamburgerMenu: true } } })
    const closeBtn = screen.getAllByRole('button')[0]
    await userEvent.click(closeBtn)
    expect(store.getState().utils.isShowHamburgerMenu).toBe(false)
  })
})
