// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import AnalyzeResumeSection from '@/components/profile/candidate/Resume/AnalyzeResumeSection'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

beforeEach(() => resetAxios())

describe('AnalyzeResumeSection', () => {
  it('prompts to upload when no resume exists', async () => {
    const setUpload = vi.fn()
    renderWithProviders(<AnalyzeResumeSection user={{ user: {} }} setIsUploadResume={setUpload} />)
    expect(screen.getByText(/Build Your Profile from a Resume/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Upload Resume/ }))
    expect(setUpload).toHaveBeenCalledWith(true)
  })
  it('dispatches analyze when a resume url exists', async () => {
    renderWithProviders(<AnalyzeResumeSection user={{ user: { resumeUrl: 'u' } }} setIsUploadResume={vi.fn()} />)
    expect(screen.getByText(/Create Your Professional Profile/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Build Your Profile/ }))
    expect(axiosFns.get.mock.calls.length + axiosFns.post.mock.calls.length).toBeGreaterThan(0)
  })
  it('shows a disabled working state while analysing', () => {
    renderWithProviders(<AnalyzeResumeSection user={{ user: { resumeUrl: 'u' } }} setIsUploadResume={vi.fn()} />, { preloadedState: { auth: { analyzeUserResumeStatus: 'pending' } } })
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText(/Hold tight/)).toBeInTheDocument()
  })
})
