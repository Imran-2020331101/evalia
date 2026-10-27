// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import PreviewedShortListModal from '@/components/workspace/recruiters/jobs/my-jobs/shortlist/PreviewedShortListModal'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { toast } from 'sonner'
import { setNav } from '../../../../../../helpers/navMock'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/components/workspace/recruiters/jobs/my-jobs/shortlist/PreviewedShortlistedCard', () => ({ default: ({ candidate }: any) => <div>card-{candidate['candidate-id']}</div> }))

const cands = [{ 'candidate-id': 'c1' }, { 'candidate-id': 'c2' }]

describe('PreviewedShortListModal', () => {
  it('is hidden when there are no previewed candidates', () => {
    setNav({ pathname: '/workspace/jobs/Acme/my-jobs/j1/applicants' })
    const { container } = renderWithProviders(<PreviewedShortListModal />)
    expect(container.firstChild).toHaveClass('hidden')
  })

  it('lists candidates, cancels and accepts', async () => {
    setNav({ pathname: '/workspace/jobs/Acme/my-jobs/j1/applicants' })
    axios.patch.mockClear(); axios.post.mockClear(); axios.put.mockClear()
    const { store, container } = renderWithProviders(<PreviewedShortListModal />, {
      preloadedState: { job: { previewedShortListedCandidate: cands, recruitersSelectedJob: { _id: 'j1' } } },
    })
    expect(container.firstChild).toHaveClass('fixed')
    expect(screen.getByText('card-c1')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Accept ShortList' }))
    expect(axios.patch.mock.calls.length + axios.post.mock.calls.length + axios.put.mock.calls.length).toBe(1)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(store.getState().job.previewedShortListedCandidate).toEqual([])
  })

  it('toasts on success and on error', () => {
    setNav({ pathname: '/a/b' })
    renderWithProviders(<PreviewedShortListModal />, { preloadedState: { job: { markShortlistedByAiStatus: 'success' } } })
    expect(toast.success).toHaveBeenCalled()
    renderWithProviders(<PreviewedShortListModal />, { preloadedState: { job: { markShortlistedByAiStatus: 'error' } } })
    expect(toast.error).toHaveBeenCalled()
  })

  it('disables accept while pending', () => {
    setNav({ pathname: '/a/b' })
    renderWithProviders(<PreviewedShortListModal />, { preloadedState: { job: { markShortlistedByAiStatus: 'pending', previewedShortListedCandidate: cands } } })
    expect(screen.getByRole('button', { name: /Accept ShortList/ })).toBeDisabled()
  })
})
