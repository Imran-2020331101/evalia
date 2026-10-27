// @vitest-environment jsdom
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Skills from '@/components/profile/candidate/Resume/Skills'

const Host = ({ initial = { technical: ['React'], soft: ['Talk'], languages: ['EN'], tools: ['Git'], other: ['Misc'] } as any }) => {
  const [v, setV] = useState<any>(initial)
  return <Skills editSkills={v} setSkills={setV} />
}

describe('Skills', () => {
  it('renders nothing when skills are empty/undefined', () => {
    const { container, unmount } = render(<Host initial={{}} />)
    expect(container).toBeEmptyDOMElement()
    unmount()
    const r = render(<Host initial={null} />)
    expect(r.container).toBeEmptyDOMElement()
  })
  it('renders every category', () => {
    render(<Host />)
    for (const t of ['React', 'Talk', 'EN', 'Git', 'Misc', 'Soft Skills', 'Tools & Frameworks']) expect(screen.getByText(t)).toBeInTheDocument()
  })
  it('adds (button and Enter), ignores blank, deletes and saves', async () => {
    render(<Host />)
    await userEvent.click(within(screen.getByRole('heading', { name: /Skills/ })).getByRole('button'))
    expect(screen.getByText('Edit Skills')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Add/ })) // blank ignored
    const input = screen.getByPlaceholderText('Enter new skill')
    await userEvent.type(input, 'Vue')
    await userEvent.click(screen.getByRole('button', { name: /Add/ }))
    expect(screen.getByText('Vue')).toBeInTheDocument()
    expect(input).toHaveValue('')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'soft')
    await userEvent.type(input, 'Calm{Enter}')
    expect(screen.getByText('Calm')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Vue').querySelector('button')!)
    expect(screen.queryByText('Vue')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('Save Changes'))
    expect(screen.getByText('Calm')).toBeInTheDocument()
    expect(screen.queryByText('Edit Skills')).not.toBeInTheDocument()
  })
})
