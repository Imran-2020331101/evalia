// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import CompletedInterviewsContainer from '@/components/workspace/candidates/interviews/completed/CompletedInterviewsContainer'

vi.mock('@/components/workspace/candidates/interviews/InterviewContainer', () => ({
  default: ({ interviews }: any) => <ul>{interviews.map((i: any) => <li key={i._id}>{i._id}</li>)}</ul>,
}))

describe('CompletedInterviewsContainer', () => {
  it('shows the empty state and fetches', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } })
    renderWithProviders(<CompletedInterviewsContainer />)
    expect(await screen.findByText('No Completed Interviews')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })
  it('lists matching interviews', () => {
    renderWithProviders(<CompletedInterviewsContainer />, { preloadedState: { interview: { allInterviews: [{ _id: 'm1', interviewStatus: 'COMPLETED' }, { _id: 'x1', interviewStatus: 'SCHEDULED' }] } } })
    expect(screen.getByText('m1')).toBeInTheDocument()
    expect(screen.queryByText('x1')).not.toBeInTheDocument()
  })
  it('shows a loader while pending', () => {
    renderWithProviders(<CompletedInterviewsContainer />, { preloadedState: { interview: { getAllInterviewStatus: 'pending' } } })
    expect(screen.queryByText('No Completed Interviews')).not.toBeInTheDocument()
  })
})
