// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import JobPreview from '@/components/workspace/modals/JobPreview'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { router } from '../../../helpers/navMock'
import { toast } from 'sonner'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const job = {
  _id: 'j1', title: 'Backend Dev', salary: { from: 3, to: 5 }, workPlaceType: 'Remote', employmentLevel: 'Senior', jobType: 'Full-time',
  createdAt: new Date().toISOString(), deadline: '2030-05-05T00:00:00Z', jobDescription: 'Build APIs',
  company: { organizationName: 'Acme', businessDescription: 'We build' },
  requirements: [{ category: 'Exp', description: '5 years' }], responsibilities: [{ category: 'Code', description: 'Write code' }], skills: [{ category: 'Lang', description: 'Node' }],
}

beforeEach(() => { axios.post.mockClear() })

describe('JobPreview', () => {
  it('is hidden when no job is previewed', () => {
    const { container } = renderWithProviders(<JobPreview />)
    expect(container.firstChild).toHaveClass('hidden')
  })

  it('renders the previewed job details', () => {
    const { container } = renderWithProviders(<JobPreview />, { preloadedState: { utils: { previewedJob: job } } })
    expect(container.firstChild).toHaveClass('fixed')
    expect(screen.getByText('Backend Dev')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('$3k - $5k')).toBeInTheDocument()
    expect(screen.getByText('Build APIs')).toBeInTheDocument()
    expect(screen.getByText('5 years')).toBeInTheDocument()
    expect(screen.getByText('Write code')).toBeInTheDocument()
    expect(screen.getByText('Node')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
  })

  it('closes with the exit button', async () => {
    const { store } = renderWithProviders(<JobPreview />, { preloadedState: { utils: { previewedJob: job } } })
    await userEvent.click(screen.getByAltText('exit'))
    expect(store.getState().utils.previewedJob).toBeNull()
  })

  it('opens the organization preview', async () => {
    const { store } = renderWithProviders(<JobPreview />, { preloadedState: { utils: { previewedJob: job } } })
    await userEvent.click(screen.getByText('Acme'))
    expect(store.getState().utils.previewOrganization).toEqual(job.company)
  })

  it('redirects to profile when applying without resume', async () => {
    renderWithProviders(<JobPreview />, { preloadedState: { utils: { previewedJob: job } } })
    await userEvent.click(screen.getByRole('button', { name: /Apply/ }))
    expect(toast.error).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/profile')
  })

  it('applies and saves with a resume', async () => {
    renderWithProviders(<JobPreview />, { preloadedState: { utils: { previewedJob: job }, auth: { user: { resumeData: {} } } } })
    await userEvent.click(screen.getByRole('button', { name: /Apply/ }))
    await userEvent.click(screen.getByRole('button', { name: /^Save/ }))
    expect(axios.post).toHaveBeenCalledTimes(2)
  })

  it('reflects applied and saved state, and unsaves', async () => {
    renderWithProviders(<JobPreview />, { preloadedState: { utils: { previewedJob: job }, job: { appliedJobs: [{ _id: 'j1' }], savedJobs: [{ _id: 'j1' }] } } })
    expect(screen.getByRole('button', { name: /Applied/ })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /Saved/ }))
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/job/j1/unsave'), null, expect.anything())
  })

  it('toggles the action drawer', async () => {
    const { container } = renderWithProviders(<JobPreview />, { preloadedState: { utils: { previewedJob: job } } })
    const drawer = container.querySelector('.rounded-l-full.bg-slate-800')!
    expect(drawer).toHaveClass('translate-x-0')
    await userEvent.click(screen.getByAltText('direction'))
    expect(drawer).toHaveClass('translate-x-[210px]')
  })
})
