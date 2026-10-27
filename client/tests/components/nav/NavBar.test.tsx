// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NavBar from '@/components/nav/NavBar'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import gsap from '../../helpers/gsapMock'

const setFonts = (status: string) =>
  Object.defineProperty(document, 'fonts', { configurable: true, value: { status, ready: Promise.resolve() } })

describe('NavBar', () => {
  beforeEach(() => setFonts('loaded'))

  it('renders brand link and animates', () => {
    renderWithProviders(<NavBar />)
    expect(screen.getByText('Evalia').closest('a')).toHaveAttribute('href', '/')
    expect(gsap.set).toHaveBeenCalledWith('.navSplit', { visibility: 'visible' })
  })

  it('waits for fonts when not loaded', async () => {
    setFonts('loading')
    renderWithProviders(<NavBar />)
    await waitFor(() => expect(gsap.from).toHaveBeenCalled())
  })

  it('toggles the hamburger menu in the store', async () => {
    const { store } = renderWithProviders(<NavBar />)
    await userEvent.click(screen.getByRole('button', { hidden: true }))
    expect(store.getState().utils.isShowHamburgerMenu).toBe(true)
    await userEvent.click(screen.getByRole('button', { hidden: true }))
    expect(store.getState().utils.isShowHamburgerMenu).toBe(false)
  })
})
