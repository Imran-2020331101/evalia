// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const names = ['HeroSection', 'ServiceSection', 'InterviewSectionHero', 'InterviewShowcase', 'QuoteSection', 'CourseSectionHero', 'CourseSection']
for (const n of names) {
  vi.doMock(`@/components/home/${n}`, () => ({ default: () => <div data-testid={n} /> }))
}
const { default: HomePage } = await import('@/app/page')

it('composes the home sections in order inside the scroll container', () => {
  const { container } = render(<HomePage />)
  expect(container.firstChild).toHaveClass('scroll-container')
  const ids = screen.getAllByTestId(/.*/).map((e) => e.getAttribute('data-testid'))
  expect(ids).toEqual(names)
})
