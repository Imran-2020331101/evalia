// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyJobSingleNavbar from '@/components/workspace/recruiters/jobs/my-jobs/MyJobSingleNavbar'
import { setNav } from '../../../../../helpers/navMock'

describe('MyJobSingleNavbar', () => {
  it('links to applicants, shortlist and finalist for the current job', () => {
    setNav({ pathname: '/workspace/jobs/Acme/my-jobs/job9/applicants', params: { id: 'job9' } })
    render(<MyJobSingleNavbar />)
    expect(screen.getByRole('link', { name: 'Applicants' })).toHaveAttribute('href', '/workspace/jobs/Acme/my-jobs/job9/applicants')
    expect(screen.getByRole('link', { name: 'Shortlist' })).toHaveAttribute('href', '/workspace/jobs/Acme/my-jobs/job9/shortlist')
    expect(screen.getByRole('link', { name: 'Finalist' })).toHaveAttribute('href', '/workspace/jobs/Acme/my-jobs/job9/finalist')
  })

  it('highlights the active tab', () => {
    setNav({ pathname: '/workspace/jobs/Acme/my-jobs/job9/shortlist' })
    render(<MyJobSingleNavbar />)
    expect(screen.getByRole('link', { name: 'Shortlist' })).toHaveClass('text-blue-400')
    expect(screen.getByRole('link', { name: 'Applicants' })).not.toHaveClass('text-blue-400')
  })
})
