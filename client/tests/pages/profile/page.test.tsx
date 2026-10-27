// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const fetchUserData = vi.fn(() => ({ type: 'auth/fetchUserData/mock' }))
const getAllAppliedJobs = vi.fn(() => ({ type: 'job/getAllAppliedJobs/mock' }))
vi.mock('@/redux/features/auth', async (o) => ({ ...(await o<any>()), fetchUserData: () => fetchUserData() }))
vi.mock('@/redux/features/job', async (o) => ({ ...(await o<any>()), getAllAppliedJobs: () => getAllAppliedJobs() }))
vi.mock('@/components/profile/candidate/CandidateProfileContainer', () => ({ default: () => <div data-testid="candidate" /> }))
vi.mock('@/components/profile/recruiter/RecruiterProfileContainer', () => ({ default: ({ user }: any) => <div data-testid="recruiter">{user.user.email}</div> }))

import Page from '@/app/profile/page'

beforeEach(() => { fetchUserData.mockClear(); getAllAppliedJobs.mockClear() })
const withUser = (role: string) => ({ auth: { user: { user: { email: 'r@x.y', roles: [role] } } } })

describe('ProfilePage', () => {
  it('fetches user and applied jobs when nothing is loaded', async () => {
    renderWithProviders(<Page />)
    await waitFor(() => expect(fetchUserData).toHaveBeenCalled())
    expect(getAllAppliedJobs).toHaveBeenCalled()
  })

  it('renders nothing while there is no user (idle)', () => {
    const { container } = renderWithProviders(<Page />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the candidate profile for candidates and does not refetch the user', async () => {
    renderWithProviders(<Page />, { preloadedState: withUser('CANDIDATE') })
    expect(await screen.findByTestId('candidate')).toBeInTheDocument()
    expect(fetchUserData).not.toHaveBeenCalled()
  })

  it('shows the recruiter profile for recruiters', async () => {
    renderWithProviders(<Page />, { preloadedState: withUser('RECRUITER') })
    expect(await screen.findByTestId('recruiter')).toHaveTextContent('r@x.y')
  })

  it('does not refetch applied jobs when already loaded', async () => {
    renderWithProviders(<Page />, { preloadedState: { ...withUser('CANDIDATE'), job: { appliedJobs: [{ _id: '1' }] } } })
    await screen.findByTestId('candidate')
    expect(getAllAppliedJobs).not.toHaveBeenCalled()
  })

  it('shows the error view when the user fetch failed', async () => {
    renderWithProviders(<Page />, { preloadedState: { auth: { userStatus: 'error' } } })
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows a spinner while pending', async () => {
    const { container } = renderWithProviders(<Page />, { preloadedState: { auth: { userStatus: 'pending' } } })
    await waitFor(() => expect(container.querySelectorAll('span span').length).toBeGreaterThanOrEqual(4))
  })
})
