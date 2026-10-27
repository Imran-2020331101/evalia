// @vitest-environment jsdom
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Education from '@/components/profile/candidate/Resume/Education'

const data = [{ degree: 'BSc', institution: 'MIT', year: '2020', gpa: '3.9' }]
const Host = ({ initial = data as any[] }) => {
  const [v, setV] = useState<any[]>(initial)
  return <Education editEducation={v} setEducation={setV} />
}

describe('Education', () => {
  it('renders entries', () => {
    render(<Host />)
    expect(screen.getByText('BSc')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
    expect(document.body.textContent).toContain('2020')
  })
  it('edits, adds, removes and saves', async () => {
    render(<Host />)
    await userEvent.click(within(screen.getByRole('heading', { name: /Education/ })).getByRole('button'))
    await userEvent.type(screen.getByPlaceholderText(/Degree/), 'X')
    await userEvent.type(screen.getByPlaceholderText('Institution'), 'Y')
    await userEvent.type(screen.getByPlaceholderText(/Year/), '1')
    await userEvent.type(screen.getByPlaceholderText(/GPA/), '0')
    await userEvent.click(screen.getByText('Add Education'))
    expect(screen.getAllByPlaceholderText('Institution')).toHaveLength(2)
    const removeBtns = screen.getAllByRole('button').filter((b) => b.className.includes('red'))
    await userEvent.click(removeBtns[removeBtns.length - 1])
    expect(screen.getAllByPlaceholderText('Institution')).toHaveLength(1)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('BScX')).toBeInTheDocument()
    expect(screen.getByText('MITY')).toBeInTheDocument()
  })
})
