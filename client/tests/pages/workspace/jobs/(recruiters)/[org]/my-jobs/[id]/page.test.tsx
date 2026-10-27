// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/workspace/jobs/(recruiters)/[org]/my-jobs/[id]/page'

it('explains the recruitment workflow', () => {
  render(<Page />)
  expect(screen.getByRole('heading', { name: 'Recruitment Workflow Overview' })).toBeInTheDocument()
  for (const t of ['Applicants:', 'Shortlist:', 'Finalists:']) expect(screen.getByText(t)).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})
