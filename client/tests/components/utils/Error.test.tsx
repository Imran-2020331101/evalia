// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorView from '@/components/utils/Error'

it('shows the error message and a home link', () => {
  render(<ErrorView />)
  expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/')
})
