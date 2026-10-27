// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import ExpiredInterviewsContainer from '@/components/workspace/candidates/interviews/expired/ExpiredInterviewsContainer'

vi.mock('@/components/workspace/candidates/interviews/InterviewContainer', () => ({
  default: ({ interviews }: any) => <ul>{interviews.map((i: any) => <li key={i._id}>{i._id}</li>)}</ul>,
}))

describe('ExpiredInterviewsContainer', () => {
  it('shows the empty state and fetches', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } })
    renderWithProviders(<ExpiredInterviewsContainer />)
    expect(await screen.findByText('No Expired Interviews')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })
  it('lists matching interviews', () => {
    renderWithProviders(<ExpiredInterviewsContainer />, { preloadedState: { interview: { allInterviews: [{ _id: 'm1', interviewStatus: 'CANCELLED' }, { _id: 'x1', interviewStatus: 'COMPLETED' }] } } })
    expect(screen.getByText('m1')).toBeInTheDocument()
    expect(screen.queryByText('x1')).not.toBeInTheDocument()
  })
  it('shows a loader while pending', () => {
    renderWithProviders(<ExpiredInterviewsContainer />, { preloadedState: { interview: { getAllInterviewStatus: 'pending' } } })
    expect(screen.queryByText('No Expired Interviews')).not.toBeInTheDocument()
  })
})
