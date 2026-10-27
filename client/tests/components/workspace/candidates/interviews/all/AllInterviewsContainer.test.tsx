// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import AllInterviewsContainer from '@/components/workspace/candidates/interviews/all/AllInterviewsContainer'

vi.mock('@/components/workspace/candidates/interviews/InterviewContainer', () => ({
  default: ({ interviews }: any) => <ul>{interviews.map((i: any) => <li key={i._id}>{i._id}</li>)}</ul>,
}))

describe('AllInterviewsContainer', () => {
  it('shows the empty state and fetches', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } })
    renderWithProviders(<AllInterviewsContainer />)
    expect(await screen.findByText('No Interviews Yet')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalled()
  })
  it('lists matching interviews', () => {
    renderWithProviders(<AllInterviewsContainer />, { preloadedState: { interview: { allInterviews: [{ _id: 'm1', interviewStatus: 'SCHEDULED' }, { _id: 'x1', interviewStatus: 'COMPLETED' }] } } })
    expect(screen.getByText('m1')).toBeInTheDocument()
    expect(screen.getByText('x1')).toBeInTheDocument()
  })
  it('shows a loader while pending', () => {
    renderWithProviders(<AllInterviewsContainer />, { preloadedState: { interview: { getAllInterviewStatus: 'pending' } } })
    expect(screen.queryByText('No Interviews Yet')).not.toBeInTheDocument()
  })
})
