// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import SavedJobContainer from '@/components/workspace/candidates/jobs/SavedJobContainer'

vi.mock('@/components/workspace/candidates/jobs/JobCard', () => ({ default: ({ job }: any) => <div>card-{job._id}</div> }))

describe('SavedJobContainer', () => {
  it('shows the empty state and fetches', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } })
    renderWithProviders(<SavedJobContainer />)
    expect(await screen.findByText('No Saved Jobs Yet')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })
  it('lists job cards', () => {
    renderWithProviders(<SavedJobContainer />, { preloadedState: { job: { savedJobs: [{ _id: 'a' }, { _id: 'b' }] } } })
    expect(screen.getByText('card-a')).toBeInTheDocument()
    expect(screen.getByText('card-b')).toBeInTheDocument()
  })
  it('shows a loader while pending', () => {
    const { container } = renderWithProviders(<SavedJobContainer />, { preloadedState: { job: { getAllJobsStatus: 'pending' } } })
    expect(container.querySelector('span span')).toBeInTheDocument()
    expect(screen.queryByText('No Saved Jobs Yet')).not.toBeInTheDocument()
  })
  it('shows the error view on failure', async () => {
    renderWithProviders(<SavedJobContainer />, { preloadedState: { job: { getAllJobsStatus: 'error' } } })
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
  })
})
