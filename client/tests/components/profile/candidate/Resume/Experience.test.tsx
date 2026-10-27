// @vitest-environment jsdom
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Experience from '@/components/profile/candidate/Resume/Experience'

const data = [{ job_title: 'Dev', company: 'Acme', duration: '2020', description: ['built x'], achievements: ['won y'] }]
const Host = ({ initial = data as any[] }) => {
  const [v, setV] = useState<any[]>(initial)
  return <Experience editExperience={v} setExperience={setV} />
}
const edit = () => userEvent.click(within(screen.getByRole('heading', { name: /Experience/ })).getByRole('button'))

describe('Experience', () => {
  it('renders entries', () => {
    render(<Host />)
    expect(screen.getByText('Dev')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('built x')).toBeInTheDocument()
    expect(screen.getByText('won y')).toBeInTheDocument()
  })
  it('renders without optional lists', () => {
    render(<Host initial={[{ job_title: 'A', company: 'B', duration: 'C' }]} />)
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
  it('edits fields, arrays, adds/removes and saves', async () => {
    render(<Host />)
    await edit()
    expect(screen.getByText('Edit Experience')).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText('Job Title'), '2')
    await userEvent.type(screen.getByPlaceholderText('Company'), '2')
    await userEvent.type(screen.getByPlaceholderText(/Duration/), '2')
    await userEvent.type(screen.getByDisplayValue('built x'), '!')
    await userEvent.type(screen.getByDisplayValue('won y'), '!')
    await userEvent.click(screen.getByText('Add Description'))
    await userEvent.click(screen.getByText('Add Achievement'))
    expect(screen.getAllByRole('textbox')).toHaveLength(3 + 2 + 2)
    // remove one description (first small X within description row)
    await userEvent.click(screen.getAllByRole('button').find((b) => b.className.includes('text-red-400') && b.parentElement?.querySelector('input.flex-1'))!)
    await userEvent.click(screen.getByText('Add New Experience'))
    expect(screen.getByText('Experience 2')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button').find((b) => b.parentElement?.textContent === 'Experience 2')!)
    expect(screen.queryByText('Experience 2')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('Save Changes'))
    expect(screen.getByText('Dev2')).toBeInTheDocument()
    expect(screen.getByText('Acme2')).toBeInTheDocument()
  })
})
