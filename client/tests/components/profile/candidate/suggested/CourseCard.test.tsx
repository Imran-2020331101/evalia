// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import CourseCard from '@/components/profile/candidate/suggested/CourseCard'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const course = { videoId: 'v1', title: 'Redux 101', description: 'desc', channelId: 'c1', channelTitle: 'Chan', publishedAt: '2024-03-05T00:00:00Z', thumbnails: { medium: { url: 'http://img/m.jpg' } } }
beforeEach(() => { resetAxios(); vi.spyOn(console, 'log').mockImplementation(() => {}) })

describe('profile suggested CourseCard', () => {
  it('renders info and links', () => {
    renderWithProviders(<CourseCard course={course} />)
    expect(screen.getByText('Redux 101')).toBeInTheDocument()
    expect(screen.getByAltText('Redux 101 thumbnail')).toHaveAttribute('src', 'http://img/m.jpg')
    expect(screen.getByLabelText('Open channel Chan')).toHaveAttribute('href', 'https://www.youtube.com/channel/c1')
    expect(document.querySelector('time')).toBeInTheDocument()
  })
  it('hides date when from profile; falls back for missing fields', () => {
    renderWithProviders(<CourseCard course={{ videoId: 'v', title: 'T' }} fromProfile className="zz" />)
    expect(document.querySelector('time')).not.toBeInTheDocument()
    expect(screen.getByText('No description available.')).toBeInTheDocument()
    expect(screen.getByText('Unknown channel')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('zz')
  })
  it('save dispatches post; saved state toggles to unsave', async () => {
    renderWithProviders(<CourseCard course={course} />)
    await userEvent.click(screen.getByRole('button', { name: /Save/ }))
    expect(axiosFns.post).toHaveBeenCalled()
  })
  it('unsaves when already saved and resets status on success', async () => {
    const { store } = renderWithProviders(<CourseCard course={course} />, { preloadedState: { course: { savedCourses: [{ videoId: 'v1' }] } } })
    const btn = await screen.findByRole('button', { name: /Saved/ })
    await userEvent.click(btn)
    expect(axiosFns.delete).toHaveBeenCalledWith(expect.stringContaining('/course/delete/v1'), expect.anything())
    expect(store.getState().course.unsaveCourseStatus).not.toBe('success')
  })
})
