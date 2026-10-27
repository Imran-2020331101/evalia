// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import CourseCard from '@/components/workspace/candidates/courses/CourseCard'

const course = { videoId: 'v1', title: 'Redux', description: 'desc', channelId: 'c1', channelTitle: 'Chan', publishedAt: '2024-03-05T00:00:00Z', thumbnails: { medium: { url: 'http://img/m.jpg' } } }

describe('candidate CourseCard', () => {
  beforeEach(() => { axios.post.mockClear(); axios.delete.mockClear() })

  it('renders info, thumbnail and links', () => {
    renderWithProviders(<CourseCard course={course} />)
    expect(screen.getByText('Redux')).toBeInTheDocument()
    expect(screen.getByAltText('Redux thumbnail')).toHaveAttribute('src', 'http://img/m.jpg')
    expect(screen.getByRole('link', { name: /Open channel Chan/ })).toHaveAttribute('href', 'https://www.youtube.com/channel/c1')
    expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument()
  })
  it('falls back without optional data', () => {
    renderWithProviders(<CourseCard course={{ videoId: 'x', title: 'T' }} />)
    expect(screen.getByText('No description available.')).toBeInTheDocument()
    expect(screen.getByText('Unknown channel')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
  it('saves a course on click', async () => {
    renderWithProviders(<CourseCard course={course} />)
    await userEvent.click(screen.getByRole('button', { name: /Save/ }))
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/course/save'), course, expect.anything())
  })
  it('shows Saved for stored courses and unsaves on click', async () => {
    renderWithProviders(<CourseCard course={course} />, { preloadedState: { course: { savedCourses: [{ videoId: 'v1' }] } } })
    const btn = await screen.findByRole('button', { name: /Saved/ })
    await userEvent.click(btn)
    expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/course/delete/v1'), expect.anything())
  })
})
