// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import AppliedJobContainer from '@/components/workspace/candidates/jobs/AppliedJobContainer'

vi.mock('@/components/workspace/candidates/jobs/JobCard', () => ({ default: ({ job }: any) => <div>card-{job._id}</div> }))

describe('AppliedJobContainer', () => {
  it('shows the empty state and fetches', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } })
    renderWithProviders(<AppliedJobContainer />)
    expect(await screen.findByText('No Applied Jobs Yet')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })
  it('lists job cards', () => {
    renderWithProviders(<AppliedJobContainer />, { preloadedState: { job: { appliedJobs: [{ _id: 'a' }, { _id: 'b' }] } } })
    expect(screen.getByText('card-a')).toBeInTheDocument()
    expect(screen.getByText('card-b')).toBeInTheDocument()
  })
  it('shows a loader while pending', () => {
    const { container } = renderWithProviders(<AppliedJobContainer />, { preloadedState: { job: { getAllJobsStatus: 'pending' } } })
    expect(container.querySelector('span span')).toBeInTheDocument()
    expect(screen.queryByText('No Applied Jobs Yet')).not.toBeInTheDocument()
  })
  it('shows the error view on failure', async () => {
    renderWithProviders(<AppliedJobContainer />, { preloadedState: { job: { getAllJobsStatus: 'error' } } })
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
  })
})
