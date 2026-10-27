// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import MyJobsContainer from '@/components/workspace/recruiters/jobs/my-jobs/MyJobsContainer'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('@/components/workspace/recruiters/jobs/my-jobs/JobCard', () => ({ default: ({ job }: any) => <div>job-{job._id}</div> }))

describe('MyJobsContainer', () => {
  it('renders a card per job', () => {
    renderWithProviders(<MyJobsContainer />, { preloadedState: { job: { myJobs: [{ _id: 'a' }, { _id: 'b' }] } } })
    expect(screen.getByText('job-a')).toBeInTheDocument()
    expect(screen.getByText('job-b')).toBeInTheDocument()
  })
  it('shows a loader while fetching', () => {
    const { container } = renderWithProviders(<MyJobsContainer />, { preloadedState: { job: { fetchJobStatus: 'pending' } } })
    expect(container.querySelector('.absolute span')).toBeInTheDocument()
  })
  it('renders nothing when idle and empty', () => {
    const { container } = renderWithProviders(<MyJobsContainer />)
    expect(container.querySelector('.absolute')).not.toBeInTheDocument()
  })
})
