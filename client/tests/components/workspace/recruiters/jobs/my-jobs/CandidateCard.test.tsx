// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import CandidateCard from '@/components/workspace/recruiters/jobs/my-jobs/CandidateCard'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

const applicant = { user: { name: 'Jane', location: 'Dhaka', profilePictureUrl: 'http://img/p.png' } }
const base = { applicantId: 'u1', applicantStatus: 'PENDING', appliedAt: new Date().toISOString(), reviewId: 'rev1', candidateEmail: 'j@x.com', selected: [] as string[], toggleSelectSingle: vi.fn() }
const jobState = { job: { recruitersSelectedJob: { _id: 'job1' } } }

beforeEach(() => {
  axios.get.mockReset(); axios.post.mockReset(); axios.patch.mockReset()
  axios.get.mockImplementation((url: string) => url.includes('/interviews/job/') ? Promise.resolve({ data: { data: { id: 'int1', interviewStatus: 'COMPLETED' } } }) : Promise.resolve({ data: { data: applicant } }))
  axios.post.mockRejectedValue({}); axios.patch.mockRejectedValue({})
})

describe('recruiter CandidateCard', () => {
  it('renders nothing until the applicant loads', async () => {
    axios.get.mockRejectedValue(new Error('x'))
    const { container } = renderWithProviders(<CandidateCard {...base} />)
    await waitFor(() => expect(axios.get).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('renders applicant info and a selection checkbox for pending', async () => {
    renderWithProviders(<CandidateCard {...base} />, { preloadedState: jobState })
    expect(await screen.findByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toHaveClass('text-blue-500')
    expect(screen.getByText('Dhaka')).toBeInTheDocument()
    expect(screen.getByText(/Applied :/)).toBeInTheDocument()
    expect(screen.getByAltText('profile pic')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox'))
    expect(base.toggleSelectSingle).toHaveBeenCalledWith('u1')
  })

  it('reflects selected state', async () => {
    renderWithProviders(<CandidateCard {...base} selected={['u1']} />, { preloadedState: jobState })
    expect(await screen.findByRole('checkbox')).toBeChecked()
  })

  it('opens the profile preview with the review id', async () => {
    const { store } = renderWithProviders(<CandidateCard {...base} />, { preloadedState: jobState })
    await userEvent.click(await screen.findByText('Jane'))
    expect(store.getState().utils.compatibilityReviewId).toBe('rev1')
    expect(store.getState().utils.previewedCandidate).toEqual(applicant)
  })

  it('pending: mark finalist and reject dispatch requests', async () => {
    renderWithProviders(<CandidateCard {...base} />, { preloadedState: jobState })
    await screen.findByText('Jane')
    await userEvent.click(screen.getByRole('button', { name: 'Mark as Finalist' }), { pointerEventsCheck: 0 })
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }), { pointerEventsCheck: 0 })
    expect(axios.post.mock.calls.length + axios.patch.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('shortlisted: shows interview summary for completed interviews', async () => {
    const { store } = renderWithProviders(<CandidateCard {...base} applicantStatus="SHORTLISTED" />, { preloadedState: jobState })
    expect(await screen.findByText('SHORTLISTED')).toHaveClass('text-indigo-400')
    const btn = await screen.findByRole('button', { name: 'View Interview Summary' })
    await userEvent.click(btn, { pointerEventsCheck: 0 })
    expect(store.getState().interview.previewedInterviewSummaryId).toBe('int1')
    expect(screen.queryByRole('button', { name: 'Mark as Finalist' })).not.toBeInTheDocument()
  })

  it('accepted: no checkbox and no actions', async () => {
    renderWithProviders(<CandidateCard {...base} applicantStatus="ACCEPTED" appliedAt={undefined} />, { preloadedState: jobState })
    expect(await screen.findByText('ACCEPTED')).toHaveClass('text-teal-500')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByText(/Applied :/)).not.toBeInTheDocument()
  })
})
