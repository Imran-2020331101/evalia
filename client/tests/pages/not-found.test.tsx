// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

it('shows 404 with recovery links', () => {
  render(<NotFound />)
  expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  expect(screen.getByText(/This Page Isn't Available/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Go back to Workspace' })).toHaveAttribute('href', '/workspace')
  expect(screen.getByRole('link', { name: 'Visit Help Center' })).toHaveAttribute('href', '/profile/support')
})
