// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import CourseCard from '@/components/home/CourseCard'
import { renderWithProviders } from '../../helpers/renderWithProviders'

const course = {
  videoId: 'v1',
  title: 'Learn Redux',
  description: 'A great course',
  channelId: 'c1',
  channelTitle: 'Chan',
  publishedAt: '2024-03-05T00:00:00Z',
  thumbnails: { high: { url: 'http://img/high.jpg' }, medium: { url: 'http://img/m.jpg' } },
}

describe('home CourseCard', () => {
  it('renders course info and links', () => {
    renderWithProviders(<CourseCard course={course} className="extra" />)
    expect(screen.getByRole('article')).toHaveClass('extra')
    expect(screen.getByText('Learn Redux')).toBeInTheDocument()
    expect(screen.getByText('A great course')).toBeInTheDocument()
    expect(screen.getByAltText('Learn Redux')).toHaveAttribute('src', 'http://img/high.jpg')
    expect(screen.getByRole('link', { name: /Open channel Chan/ })).toHaveAttribute('href', 'https://www.youtube.com/channel/c1')
    expect(screen.getByTitle('Open on YouTube')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=v1')
    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  it('falls back when optional data is missing', () => {
    renderWithProviders(<CourseCard course={{ videoId: 'v2', title: 'T' }} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('No description available.')).toBeInTheDocument()
    expect(screen.getByText('Unknown channel')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open channel channel/ })).toHaveAttribute('href', '#')
  })

  it('uses medium thumbnail when high is missing', () => {
    renderWithProviders(<CourseCard course={{ ...course, thumbnails: { medium: { url: 'http://img/m.jpg' } } }} />)
    expect(screen.getByAltText('Learn Redux')).toHaveAttribute('src', 'http://img/m.jpg')
  })

  it('reads saved state from the store without crashing', () => {
    const { store } = renderWithProviders(<CourseCard course={course} />, { preloadedState: { course: { savedCourses: [{ videoId: 'v1' }] } } })
    expect(store.getState().course.savedCourses).toHaveLength(1)
  })

  it('resets unsave status after a successful unsave', () => {
    const { store } = renderWithProviders(<CourseCard course={course} />, { preloadedState: { course: { unsaveCourseStatus: 'error' } } })
    expect(store.getState().course.unsaveCourseStatus).toBe('error')
  })
})
