// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecruitmentAndGuidelineContainer from '@/components/profile/recruitment&guideline/RecruitmentAndGuidelineContainer'

it('renders all guideline sections and support link', () => {
  render(<RecruitmentAndGuidelineContainer />)
  expect(screen.getByRole('heading', { name: 'Evalia Recruitment Guidelines' })).toBeInTheDocument()
  for (const h of ['For Recruiters', 'For Candidates', 'Ethical Standards', 'Need Assistance?']) {
    expect(screen.getByRole('heading', { name: h })).toBeInTheDocument()
  }
  expect(screen.getByRole('link', { name: 'Support Page' })).toHaveAttribute('href', '/profile/support')
  expect(screen.getByRole('link', { name: 'evalia.apostrophe@gmail.com' })).toHaveAttribute('href', 'mailto:evalia.apostrophe@gmail.com')
})
