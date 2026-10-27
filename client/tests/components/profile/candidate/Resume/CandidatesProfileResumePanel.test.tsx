// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import Panel from '@/components/profile/candidate/Resume/CandidatesProfileResumePanel'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const resume = {
  experience: [{ job_title: 'Dev', company: 'Acme', duration: '2020' }],
  education: [{ degree: 'BSc', institution: 'MIT', year: '2020' }],
  skills: { technical: ['React'] },
  projects: [{ title: 'Proj', description: 'd' }],
  awards: [{ title: 'Best', organization: 'O', year: '1' }],
  certifications: [{ title: 'AWS', provider: 'P', date: 'D' }],
}
beforeEach(() => { resetAxios(); vi.spyOn(console, 'log').mockImplementation(() => {}) })

describe('CandidatesProfileResumePanel', () => {
  it('shows the saved resume sections and saves changes', async () => {
    renderWithProviders(<Panel isPreview={false} />, { preloadedState: { auth: { user: { resumeData: resume } } } })
    for (const t of ['Dev', 'BSc', 'Proj', 'AWS', 'Best', 'React']) expect(screen.getByText(t)).toBeInTheDocument()
    expect(screen.queryByText('Add to my profile')).not.toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button')[0])
    expect(axiosFns.post).toHaveBeenCalledWith(expect.stringContaining('/resume/save'), expect.objectContaining({ experience: resume.experience }), expect.anything())
  })

  it('previews an analysed resume and offers Add to my profile', async () => {
    renderWithProviders(<Panel isPreview />, { preloadedState: { auth: { user: { user: {} }, analyzedUserResume: resume } } })
    expect(screen.getByText('Dev')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Add to my profile'))
    expect(axiosFns.post).toHaveBeenCalledWith(expect.stringContaining('/resume/save'), expect.objectContaining({ education: resume.education }), expect.anything())
    expect(screen.getByText('reset')).toBeInTheDocument()
  })

  it('disables saving and shows spinner text while pending', () => {
    renderWithProviders(<Panel isPreview />, { preloadedState: { auth: { user: { user: {} }, analyzedUserResume: resume, saveUserResumeStatus: 'pending' } } })
    expect(screen.getByText(/Saving to your profile/)).toBeInTheDocument()
  })
})
