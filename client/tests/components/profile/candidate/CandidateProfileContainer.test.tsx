// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('@/components/profile/candidate/suggested/JobCard', () => ({ default: ({ jobItem }: any) => <div data-testid="job">{jobItem.jobId}</div> }))
vi.mock('@/components/profile/candidate/suggested/CourseCard', () => ({ default: ({ course }: any) => <div data-testid="course">{course.title}</div> }))
vi.mock('@/components/profile/candidate/Resume/CandidatesProfileResumePanel', () => ({ default: ({ isPreview }: any) => <div data-testid="panel">{String(isPreview)}</div> }))
vi.mock('@/components/profile/candidate/Resume/AnalyzeResumeSection', () => ({
  default: ({ setIsUploadResume }: any) => <button onClick={() => setIsUploadResume(true)}>analyze-section</button>,
}))
vi.mock('@/components/profile/candidate/UploadResume', () => ({ default: () => <div>upload-resume-modal</div> }))

import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import CandidateProfileContainer from '@/components/profile/candidate/CandidateProfileContainer'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const user = { user: { name: 'Sam', bio: 'Dev', location: 'Dhaka', email: 's@x.com', aboutMe: 'about sam', coverPictureUrl: 'http://c.jpg', profilePictureUrl: 'http://p.jpg', resumeUrl: 'http://r.pdf' } }
beforeEach(() => { resetAxios(); vi.spyOn(console, 'log').mockImplementation(() => {}) })

describe('CandidateProfileContainer', () => {
  it('renders user info, empty suggestion states and the analyze section', async () => {
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user } } })
    expect(screen.getByText('Sam')).toBeInTheDocument()
    expect(screen.getByText('about sam')).toBeInTheDocument()
    expect(screen.getByText('analyze-section')).toBeInTheDocument()
    expect(await screen.findByText('No Suggested Jobs Available')).toBeInTheDocument()
    expect(screen.getByText('No Suggested courses Available')).toBeInTheDocument()
    expect(axiosFns.get).toHaveBeenCalledWith(expect.stringContaining('/course/suggestions'), expect.anything())
  })
  it('shows placeholders for a bare profile', () => {
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user: { user: {} } } } })
    expect(screen.getByText('No bio found, make a short bio')).toBeInTheDocument()
    expect(screen.queryByText('Resume.pdf')).not.toBeInTheDocument()
  })
  it('lists suggested jobs and courses', async () => {
    axiosFns.get.mockImplementation(async (url: string) => (url.includes('job/suggestions') ? { data: { data: [{ jobId: 'j1' }, { jobId: 'j2' }] } } : Promise.reject(new Error('x'))))
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user }, course: { allCourses: [{ videoId: 'v', title: 'Course A' }] } } })
    expect(await screen.findAllByTestId('job')).toHaveLength(2)
    expect(screen.getByTestId('course')).toHaveTextContent('Course A')
  })
  it('shows the resume panel in saved / preview modes', () => {
    const { unmount } = renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user: { ...user, resumeData: {} } } } })
    expect(screen.getByTestId('panel')).toHaveTextContent('false')
    unmount()
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user, analyzedUserResume: { a: 1 } } } })
    expect(screen.getByTestId('panel')).toHaveTextContent('true')
  })
  it('shows a loader while courses load', () => {
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user }, course: { allCourseStatus: 'pending' } } })
    expect(screen.queryByText('No Suggested courses Available')).not.toBeInTheDocument()
  })
  it('edits basic info and cancels', async () => {
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user } } })
    await userEvent.click(screen.getByText('Sam').querySelector('button')!)
    const name = screen.getByLabelText('Full Name')
    expect(name).toHaveValue('Sam')
    await userEvent.type(name, 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(axiosFns.patch.mock.calls.length + axiosFns.put.mock.calls.length + axiosFns.post.mock.calls.length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Sam')).toBeInTheDocument()
  })
  it('closes edit mode when update succeeds', async () => {
    const { store } = renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user, userBasicInfoUpdateStatus: 'success' } } })
    await waitFor(() => expect(store.getState().auth.userBasicInfoUpdateStatus).toBe('idle'))
  })
  it('toggles and edits the about section', async () => {
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user } } })
    await userEvent.click(screen.getByText('About').parentElement!.querySelector('button')!)
    await userEvent.type(document.querySelector('textarea')!, '!')
    await userEvent.click(screen.getByText('Edit About').parentElement!.querySelector('button')!)
    expect(axiosFns.patch.mock.calls.length + axiosFns.put.mock.calls.length + axiosFns.post.mock.calls.length).toBeGreaterThan(0)
  })
  it('opens/closes the resume upload modal and the resume preview', async () => {
    renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user } } })
    await userEvent.click(screen.getByRole('button', { name: 'Upload a new CV' }))
    expect(screen.getByText('upload-resume-modal')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(screen.queryByText('upload-resume-modal')).not.toBeInTheDocument())
    await userEvent.click(screen.getByText('Resume.pdf'))
    expect(document.querySelector('iframe')).toHaveAttribute('src', 'http://r.pdf')
    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(document.querySelector('iframe')).not.toBeInTheDocument())
  })
  it('uploads cover/profile photos', () => {
    const { container } = renderWithProviders(<CandidateProfileContainer />, { preloadedState: { auth: { user } } })
    const [profile, cover] = Array.from(container.querySelectorAll('input[type=file]'))
    const f = new File(['x'], 'a.png', { type: 'image/png' })
    fireEvent.change(cover, { target: { files: [f] } })
    fireEvent.change(profile, { target: { files: [f] } })
    fireEvent.change(cover, { target: { files: [] } })
    fireEvent.change(profile, { target: { files: [] } })
    expect(axiosFns.post.mock.calls.length + axiosFns.put.mock.calls.length + axiosFns.patch.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})
