// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CandidatesResumePanel, { dummyCandidateData } from '@/components/utils/CandidatesResumePanel'

describe('CandidatesResumePanel', () => {
  it('renders nothing without data', () => {
    const { container } = render(<CandidatesResumePanel isScroll={false} resumeData={null} />)
    expect(container).toBeEmptyDOMElement()
  })
  it('renders every section from full data', () => {
    render(<CandidatesResumePanel isScroll resumeData={dummyCandidateData} />)
    for (const h of ['Experience', 'Education', 'Projects', 'Certifications', 'Awards & Honors', 'Skills']) {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument()
    }
    expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument()
    expect(screen.getByText('Improved page load speed by 45%')).toBeInTheDocument()
    expect(screen.getByText(/GPA: 3.9/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View Project/ })).toHaveAttribute('href', dummyCandidateData.projects[0].url)
    expect(screen.getByText('Employee of the Year')).toBeInTheDocument()
    for (const t of ['Technical', 'Soft Skills', 'Languages', 'Tools & Frameworks', 'Other']) expect(screen.getByText(t)).toBeInTheDocument()
  })
  it('applies scroll class and hides empty sections', () => {
    const { container } = render(<CandidatesResumePanel isScroll resumeData={{ education: [{ degree: 'D', institution: 'I', year: '2020' }] }} />)
    expect(container.firstChild).toHaveClass('overflow-y-auto')
    expect(screen.queryByText('Experience')).not.toBeInTheDocument()
    expect(screen.queryByText(/GPA/)).not.toBeInTheDocument()
  })
  it('omits scroll class when isScroll is false', () => {
    const { container } = render(<CandidatesResumePanel isScroll={false} resumeData={{ skills: { technical: ['X'] } }} />)
    expect(container.firstChild).not.toHaveClass('overflow-y-auto')
    expect(screen.getByText('X')).toBeInTheDocument()
  })
})
