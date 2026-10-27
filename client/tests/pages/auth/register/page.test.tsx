// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import RegisterPage from '@/app/auth/register/page'

vi.spyOn(console, 'log').mockImplementation(() => {})

describe('RegisterPage', () => {
  it('renders the fields, google auth and login link', () => {
    renderWithProviders(<RegisterPage />)
    for (const l of ['Name', 'Email', 'Password']) expect(screen.getByLabelText(l)).toBeInTheDocument()
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sign in/ })).toHaveAttribute('href', '/auth/login')
  })

  it('writes typed values into the redux form state', async () => {
    const { store } = renderWithProviders(<RegisterPage />)
    await userEvent.type(screen.getByLabelText('Name'), 'Ann')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('Password'), 'abcdef')
    expect(store.getState().auth.registerFormData).toMatchObject({ name: 'Ann', email: 'a@b.co', password: 'abcdef' })
    expect(screen.getByLabelText('Name')).toHaveValue('Ann')
  })

  it('requires all fields', async () => {
    const { store } = renderWithProviders(<RegisterPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.getByText('All fields are required')).toBeInTheDocument()
    expect(store.getState().utils.isShowAuthRole).toBe(false)
  })

  it('rejects short passwords and clears the error when typing', async () => {
    renderWithProviders(<RegisterPage />, { preloadedState: { auth: { registerFormData: { name: 'A', email: 'a@b.co', password: '123' } } } })
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Name'), 'x')
    expect(screen.queryByText(/at least 6/)).not.toBeInTheDocument()
  })

  it('opens the role selection when the form is valid', async () => {
    const { store } = renderWithProviders(<RegisterPage />, { preloadedState: { auth: { registerFormData: { name: 'A', email: 'a@b.co', password: '123456' } } } })
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(store.getState().utils.isShowAuthRole).toBe(true)
  })

  it('toggles password visibility', async () => {
    renderWithProviders(<RegisterPage />)
    const pw = screen.getByLabelText('Password')
    const toggle = pw.parentElement!.querySelector('button')!
    await userEvent.click(toggle)
    expect(pw).toHaveAttribute('type', 'text')
  })
})
