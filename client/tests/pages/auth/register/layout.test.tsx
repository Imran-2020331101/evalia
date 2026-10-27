// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from '@/app/auth/register/layout'

it('passes children straight through', () => {
  const { container } = render(<Layout><p>child</p></Layout>)
  expect(screen.getByText('child')).toBeInTheDocument()
  expect(container.firstChild?.nodeName).toBe('P')
})
