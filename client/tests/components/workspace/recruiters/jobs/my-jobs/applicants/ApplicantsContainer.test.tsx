// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import Container from '@/components/workspace/recruiters/jobs/my-jobs/applicants/ApplicantsContainer'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('@/components/workspace/recruiters/jobs/my-jobs/CandidateCard', () => ({
  default: (p: any) => (
    <div>
      cand-{p.applicantId}-{p.applicantStatus}-sel:{String(p.selected.includes(p.applicantId))}
      <button onClick={() => p.toggleSelectSingle(p.applicantId)}>toggle-{p.applicantId}</button>
    </div>
  ),
}))

const apps = [
  { _id: '1', status: 'PENDING', candidateId: 'a1' },
  { _id: '2', status: 'PENDING', candidateId: 'a2' },
  { _id: '3', status: 'OTHER', candidateId: 'z9' },
]
const state = { job: { recruitersSelectedJob: { _id: 'job1', applications: apps } } }

beforeEach(() => { axios.post.mockReset(); axios.patch.mockReset(); axios.put.mockReset(); axios.post.mockRejectedValue({}); axios.patch.mockRejectedValue({}); axios.put.mockRejectedValue({}) })
const writes = () => axios.post.mock.calls.length + axios.patch.mock.calls.length + axios.put.mock.calls.length

describe('applicants/ApplicantsContainer', () => {
  it('shows the empty state when nobody matches', () => {
    renderWithProviders(<Container />, { preloadedState: { job: { recruitersSelectedJob: { _id: 'j', applications: [{ _id: 'x', status: 'OTHER' }] } } } })
    expect(screen.getByText('No Pending Applications')).toBeInTheDocument()
  })

  it('shows the empty state with no selected job', () => {
    renderWithProviders(<Container />)
    expect(screen.getByText('No Pending Applications')).toBeInTheDocument()
  })

  it('lists only matching candidates', () => {
    renderWithProviders(<Container />, { preloadedState: state })
    expect(screen.getByText(/cand-a1-PENDING/)).toBeInTheDocument()
    expect(screen.getByText(/cand-a2-PENDING/)).toBeInTheDocument()
    expect(screen.queryByText(/z9/)).not.toBeInTheDocument()
  })

  it('select-all and single selection drive the action button', async () => {
    renderWithProviders(<Container />, { preloadedState: state })
    const create = screen.getByRole('button', { name: 'Create Shortlist' })
    expect(create).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'toggle-a1' }))
    expect(create).toBeEnabled()
    expect(screen.getByText(/cand-a1-.*sel:true/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'toggle-a1' }))
    expect(create).toBeDisabled()
    await userEvent.click(screen.getByLabelText('Select all'))
    expect(screen.getByText(/cand-a2-.*sel:true/)).toBeInTheDocument()
    expect(screen.getByLabelText('Select all')).toBeChecked()
    await userEvent.click(screen.getByLabelText('Select all'))
    expect(screen.getByText(/cand-a2-.*sel:false/)).toBeInTheDocument()
  })

  it('submits the selection and rejects remaining', async () => {
    renderWithProviders(<Container />, { preloadedState: state })
    await userEvent.click(screen.getByLabelText('Select all'))
    await userEvent.click(screen.getByRole('button', { name: 'Create Shortlist' }))
    expect(writes()).toBe(1)
    await userEvent.click(screen.getByRole('button', { name: /Reject Remaining/ }))
    expect(writes()).toBe(2)
  })

  it('generates an AI shortlist from the menu panel', async () => {
    renderWithProviders(<Container />, { preloadedState: state })
    expect(screen.getByText('2 applicants have applied for this job.')).toBeInTheDocument()
    const input = screen.getByRole('spinbutton')
    await userEvent.click(screen.getByRole('button', { name: '+' }))
    expect(input).toHaveValue(2)
    await userEvent.click(screen.getByRole('button', { name: '+' }))
    expect(input).toHaveValue(2)
    await userEvent.click(screen.getByRole('button', { name: '−' }))
    expect(input).toHaveValue(1)
    await userEvent.click(screen.getByRole('button', { name: '−' }))
    expect(input).toHaveValue(1)
    axios.get.mockClear()
    await userEvent.click(screen.getByRole('button', { name: /Generate Shortlist/ }))
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/resume/job1/shortlist/1'), expect.anything())
  })

  it('shows rejecting state', () => {
    renderWithProviders(<Container />, { preloadedState: { ...state, job: { ...state.job, rejectCandidateStatus: 'pending' } } })
    expect(screen.getByText('Rejecting remaining')).toBeInTheDocument()
  })
})
