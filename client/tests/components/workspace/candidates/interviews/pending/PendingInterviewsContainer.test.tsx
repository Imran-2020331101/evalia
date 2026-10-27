// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import PendingInterviewsContainer from '@/components/workspace/candidates/interviews/pending/PendingInterviewsContainer'

vi.mock('@/components/workspace/candidates/interviews/InterviewContainer', () => ({
  default: ({ interviews }: any) => <ul>{interviews.map((i: any) => <li key={i._id}>{i._id}</li>)}</ul>,
}))

describe('PendingInterviewsContainer', () => {
  it('shows the empty state and fetches', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } })
    renderWithProviders(<PendingInterviewsContainer />)
    expect(await screen.findByText('No Pending Interviews')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })
  it('lists matching interviews', () => {
    renderWithProviders(<PendingInterviewsContainer />, { preloadedState: { interview: { allInterviews: [{ _id: 'm1', interviewStatus: 'SCHEDULED' }, { _id: 'x1', interviewStatus: 'COMPLETED' }] } } })
    expect(screen.getByText('m1')).toBeInTheDocument()
    expect(screen.queryByText('x1')).not.toBeInTheDocument()
  })
  it('shows a loader while pending', () => {
    renderWithProviders(<PendingInterviewsContainer />, { preloadedState: { interview: { getAllInterviewStatus: 'pending' } } })
    expect(screen.queryByText('No Pending Interviews')).not.toBeInTheDocument()
  })
})
