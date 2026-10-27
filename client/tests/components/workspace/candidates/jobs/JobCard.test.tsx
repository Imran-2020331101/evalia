// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '../../../../helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

import JobCard from '@/components/workspace/candidates/jobs/JobCard'
import { toast } from 'sonner'
import { router } from '../../../../helpers/navMock'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const job = { _id: 'j1', company: { OrganizationId: 'o1' }, title: 'Dev', jobLocation: 'Dhaka', workPlaceType: 'Remote', salary: { from: 1, to: 2 }, createdAt: new Date().toISOString(), deadline: '2030-01-01' }
const org = { organizationName: 'Acme', organizationProfileImageUrl: 'http://img/o.png' }

beforeEach(() => {
  axios.get.mockReset(); axios.post.mockReset(); axios.delete.mockReset()
  axios.get.mockResolvedValue({ data: org })
  axios.post.mockRejectedValue({})
  axios.delete.mockRejectedValue({})
})

describe('candidate JobCard', () => {
  it('renders nothing until the organization loads, then the job', async () => {
    const { container } = renderWithProviders(<JobCard job={job} />)
    expect(container).toBeEmptyDOMElement()
    expect(await screen.findByText('Dev')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('$1k - $2k')).toBeInTheDocument()
    expect(screen.getByAltText('company logo')).toHaveAttribute('src', org.organizationProfileImageUrl)
  })

  it('stays empty if org fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('x'))
    const { container } = renderWithProviders(<JobCard job={job} />)
    await waitFor(() => expect(axios.get).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('previews the organization and the job', async () => {
    const { store } = renderWithProviders(<JobCard job={job} />)
    await userEvent.click(await screen.findByAltText('company logo'))
    expect(store.getState().utils.previewOrganization).toEqual(org)
    await userEvent.click(screen.getByText('Dev'))
    expect(store.getState().utils.previewedJob).toMatchObject({ _id: 'j1', company: org })
  })

  it('asks for a profile before applying', async () => {
    renderWithProviders(<JobCard job={job} />)
    await userEvent.click(await screen.findByRole('button', { name: /Apply/ }))
    expect(toast.error).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/profile')
  })

  it('applies and saves when user has a resume', async () => {
    const { store } = renderWithProviders(<JobCard job={job} />, { preloadedState: { auth: { user: { resumeData: {} } } } })
    await userEvent.click(await screen.findByRole('button', { name: /Apply/ }))
    expect(axios.post).toHaveBeenCalled()
    await waitFor(() => expect(store.getState().job.applyJobStatus).toBe('error'))
    axios.post.mockClear()
    await userEvent.click(screen.getByRole('button', { name: /Save/ }))
    expect(axios.post).toHaveBeenCalledTimes(1)
  })

  it('shows applied (disabled) and saved states, and unsaves', async () => {
    renderWithProviders(<JobCard job={job} />, { preloadedState: { job: { appliedJobs: [{ _id: 'j1' }], savedJobs: [{ _id: 'j1' }] } } })
    expect(await screen.findByRole('button', { name: /Applied/ })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /Saved/ }))
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/job/j1/unsave'), null, expect.anything())
  })
})
