// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/components/workspace/recruiters/jobs/my-jobs/applicants/ApplicantsContainer', () => ({ default: () => <div data-testid="child" /> }))

import Page from '@/app/workspace/jobs/(recruiters)/[org]/my-jobs/[id]/applicants/page'

it('renders its container inside a full-size wrapper', () => {
  const { container } = render(<Page />)
  expect(screen.getByTestId('child')).toBeInTheDocument()
  expect((container.firstChild as HTMLElement).className).toContain('w-full h-full')
})
