// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
import { toast } from 'sonner'
import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import JobCard from '@/components/profile/candidate/suggested/JobCard'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { router } from '@/tests/helpers/navMock'

const job = { _id: 'j1', title: 'Backend Dev', jobLocation: 'Dhaka', company: { OrganizationId: 'o1' }, createdAt: new Date().toISOString(), deadline: '2030-01-01' }
const org = { organizationName: 'Acme', organizationProfileImageUrl: 'http://img/logo.png' }

function mockApi() {
  axiosFns.get.mockImplementation(async (url: string) =>
    url.includes('/organization/') ? { data: org } : { data: { data: job } })
}
beforeEach(() => { resetAxios(); vi.spyOn(console, 'log').mockImplementation(() => {}); vi.clearAllMocks() })

describe('suggested JobCard', () => {
  it('renders nothing until org loads (and when fetch fails)', async () => {
    const { container } = renderWithProviders(<JobCard jobItem={{ jobId: 'j1' }} />)
    await waitFor(() => expect(axiosFns.get).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('loads job + org and renders details', async () => {
    mockApi()
    renderWithProviders(<JobCard jobItem={{ jobId: 'j1', skills: 0.5, experience: 1, projects: null, education: 0.25 }} />, { preloadedState: { auth: { user: { resumeData: {} } } } })
    expect(await screen.findByText('Backend Dev')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByAltText('company logo')).toHaveAttribute('src', 'http://img/logo.png')
    expect(screen.getByText('Apply')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Show Details'))
    expect(screen.getByText('Skills (50%)')).toBeInTheDocument()
    expect(screen.queryByText(/Projects/)).not.toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Hide Details'))
    expect(screen.queryByText('Total Match')).not.toBeInTheDocument()
  })

  it('redirects to profile with a toast when applying without a resume', async () => {
    mockApi()
    renderWithProviders(<JobCard jobItem={{ jobId: 'j1' }} />)
    await userEvent.click(await screen.findByRole('button', { name: /Apply/ }))
    expect(toast.error).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/profile')
  })

  it('applies when the profile has a resume', async () => {
    mockApi()
    const { store } = renderWithProviders(<JobCard jobItem={{ jobId: 'j1' }} />, { preloadedState: { auth: { user: { resumeData: {} } } } })
    await userEvent.click(await screen.findByRole('button', { name: /Apply/ }))
    expect(axiosFns.post).toHaveBeenCalled()
    expect(store.getState().job.applyJobStatus).not.toBe('idle')
  })

  it('shows Applied (disabled) when already applied, previews job and org', async () => {
    mockApi()
    const { store } = renderWithProviders(<JobCard jobItem={{ jobId: 'j1' }} />, { preloadedState: { job: { appliedJobs: [{ _id: 'j1' }] } } })
    const applied = await screen.findByRole('button', { name: /Applied/ })
    expect(applied).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Backend Dev' }))
    expect(store.getState().utils.previewedJob).toMatchObject({ _id: 'j1', company: org })
    await userEvent.click(screen.getByAltText('company logo'))
    expect(store.getState().utils.previewOrganization).toEqual(org)
  })
})
