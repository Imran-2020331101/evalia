// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CourseSectionHero from '@/components/home/CourseSectionHero'

it('renders the course hero headline', () => {
  const { container } = render(<CourseSectionHero />)
  expect(screen.getByText('Learn What Matters')).toBeInTheDocument()
  expect(screen.getByText(/Let’s follow it/)).toBeInTheDocument()
  expect(container.querySelector('#courseHeroGradient')).toBeInTheDocument()
})
