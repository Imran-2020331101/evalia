// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GoogleSignUp from '@/components/auth/GoogleAuth'

it('renders the Google sign up button and is clickable', async () => {
  render(<GoogleSignUp />)
  expect(screen.getByAltText('google icon')).toBeInTheDocument()
  expect(screen.getByText('Sign up with Google')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button'))
})
