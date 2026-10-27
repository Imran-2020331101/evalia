// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import FinalistContainer from '@/components/workspace/recruiters/jobs/my-jobs/finalist/FinalistContainer'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('@/components/workspace/recruiters/jobs/my-jobs/CandidateCard', () => ({ default: (p: any) => <div>cand-{p.applicantId}-{p.applicantStatus}</div> }))

describe('FinalistContainer', () => {
  it('shows the empty state without finalists', () => {
    renderWithProviders(<FinalistContainer />, { preloadedState: { job: { recruitersSelectedJob: { applications: [{ _id: '1', status: 'PENDING' }] } } } })
    expect(screen.getByText('No Finalist yet')).toBeInTheDocument()
  })
  it('shows empty state when no job selected', () => {
    renderWithProviders(<FinalistContainer />)
    expect(screen.getByText('No Finalist yet')).toBeInTheDocument()
  })
  it('lists only ACCEPTED applications', () => {
    renderWithProviders(<FinalistContainer />, {
      preloadedState: { job: { recruitersSelectedJob: { applications: [
        { _id: '1', status: 'ACCEPTED', candidateId: 'a1' }, { _id: '2', status: 'PENDING', candidateId: 'a2' },
      ] } } },
    })
    expect(screen.getByText('cand-a1-ACCEPTED')).toBeInTheDocument()
    expect(screen.queryByText(/a2/)).not.toBeInTheDocument()
  })
})
