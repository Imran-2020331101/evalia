// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import InterviewSectionHero from '@/components/home/InterviewSectionHero'
import gsap from '../../helpers/gsapMock'

it('renders hero copy and kicks off scroll animation', () => {
  const { container } = render(<InterviewSectionHero />)
  expect(screen.getByText('Meet Monke')).toBeInTheDocument()
  expect(screen.getByText(/Your Interviewer Who Speaks Bengali/)).toBeInTheDocument()
  expect(container.querySelector('#interviewHeroGradient')).toBeInTheDocument()
  expect(gsap.timeline).toHaveBeenCalled()
})
