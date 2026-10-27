// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/workspace/candidates/interviews/all/AllInterviewsContainer', () => ({ default: () => <div data-testid="child" /> }))

import Page from '@/app/workspace/interviews/(candidates)/all/page'

it('renders its container inside a full-size wrapper', () => {
  const { container } = render(<Page />)
  expect(screen.getByTestId('child')).toBeInTheDocument()
  expect((container.firstChild as HTMLElement).className).toContain('w-full h-full')
})
