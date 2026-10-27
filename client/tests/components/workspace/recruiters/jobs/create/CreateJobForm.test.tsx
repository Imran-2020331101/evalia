// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React, { useState } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { toast } from 'sonner'
import CreateJobForm from '@/components/workspace/recruiters/jobs/create/CreateJobForm'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { router } from '../../../../../helpers/navMock'
import { JobType, WorkPlaceType, EmploymentLevelType } from '@/types/create-job'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

let probe: any
function Harness({ initial }: { initial?: any }) {
  const [basicState, setBasicState] = useState<any>({
    title: '', jobDescription: '', jobLocation: '', salaryFrom: '0', salaryTo: '0', deadline: '',
    jobType: JobType.FULL_TIME, isOpenJobType: false, workPlaceType: WorkPlaceType.HYBRID, isOpenWorkPlaceType: false,
    employmentLevelType: EmploymentLevelType.ENTRY, isOpenEmploymentLevelType: false, ...initial,
  })
  const [requirement, setRequirement] = useState<any[]>(initial?.req ?? [])
  const [responsibilities, setResponsibilities] = useState<any[]>(initial?.resp ?? [])
  const [skills, setSkills] = useState<any[]>(initial?.sk ?? [])
  const [interviewQA, setInterviewQA] = useState<any[]>([])
  probe = { basicState, requirement, responsibilities, skills, interviewQA }
  return (
    <CreateJobForm {...{ basicState, setBasicState, requirement, setRequirement, responsibilities, setResponsibilities, skills, setSkills, interviewQA, setInterviewQA }} />
  )
}
const dom = [{ type: 'optional', category: 'c', description: 'd' }]
const full = { title: 'T', jobDescription: 'D', jobLocation: 'L', salaryFrom: '1', salaryTo: '2', deadline: '2030-01-01', req: dom, resp: dom, sk: dom }
const store = { job: { selectedOrgId: 'o1', selectedOrg: { organizationName: 'Acme' } } }

beforeEach(() => {
  vi.clearAllMocks()
  axios.post.mockReset(); axios.post.mockRejectedValue({})
})

describe('CreateJobForm', () => {
  it('validates required fields in order when creating', async () => {
    renderWithProviders(<Harness />, { preloadedState: store })
    await userEvent.click(screen.getByRole('button', { name: 'Create A Job' }))
    expect(toast.error).toHaveBeenLastCalledWith('Please provide a title')
    await userEvent.type(screen.getByLabelText('Job title :'), 'Dev')
    await userEvent.click(screen.getByRole('button', { name: 'Create A Job' }))
    expect(toast.error).toHaveBeenLastCalledWith('Please write jobDescription')
    expect(probe.basicState.title).toBe('Dev')
  })

  it.each([
    [{ title: 'T' }, 'Please write jobDescription'],
    [{ title: 'T', jobDescription: 'D' }, 'Please provide a jobLocation'],
    [{ title: 'T', jobDescription: 'D', jobLocation: 'L' }, 'Please write salaryFrom'],
    [{ title: 'T', jobDescription: 'D', jobLocation: 'L', salaryFrom: '1' }, 'Please provide a salaryTo'],
    [{ title: 'T', jobDescription: 'D', jobLocation: 'L', salaryFrom: '1', salaryTo: '2' }, 'Please write deadline'],
    [{ ...full, req: [] }, 'You must provide at least one requirement.'],
    [{ ...full, sk: [] }, 'you must provide at least one skill'],
    [{ ...full, resp: [] }, 'you must provide at least one responsibility'],
  ])('validation message %#', async (initial: any, msg: string) => {
    if (!('salaryFrom' in initial)) initial = { ...initial, salaryFrom: '' , salaryTo: '' }
    renderWithProviders(<Harness initial={{ salaryFrom: '', salaryTo: '', ...initial }} />, { preloadedState: store })
    await userEvent.click(screen.getByRole('button', { name: 'Create A Job' }))
    expect(toast.error).toHaveBeenLastCalledWith(msg)
  })

  it('submits a valid job via the API', async () => {
    renderWithProviders(<Harness initial={full} />, { preloadedState: store })
    await userEvent.click(screen.getByRole('button', { name: 'Create A Job' }))
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
    const body = axios.post.mock.calls[0][1]
    expect(body.basic.title).toBe('T')
    expect(body.requirements).toEqual(dom)
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('something went wrong! please try again later..'))
  })

  it('redirects after a successful creation', async () => {
    renderWithProviders(<Harness initial={full} />, { preloadedState: { job: { ...store.job, createJobStatus: 'success' } } })
    expect(toast.success).toHaveBeenCalledWith('Job successfully created !')
    expect(router.push).toHaveBeenCalled()
  })

  it('selects job type, workplace and employment level from the dropdowns', async () => {
    renderWithProviders(<Harness />, { preloadedState: store })
    await userEvent.click(screen.getByText('FULL_TIME'))
    await userEvent.click(screen.getByText(/Contract/))
    expect(probe.basicState.jobType).toBe('CONTRACT')
    await userEvent.click(screen.getByText('HYBRID'))
    await userEvent.click(screen.getByText(/Remote/))
    expect(probe.basicState.workPlaceType).toBe('REMOTE')
    await userEvent.click(screen.getByText('ENTRY'))
    await userEvent.click(screen.getByText(/Mid Level/))
    expect(probe.basicState.employmentLevelType).toBe('MID')
  })

  it('adds a requirement with validation, then responsibility and skill via tabs', async () => {
    renderWithProviders(<Harness />, { preloadedState: store })
    await userEvent.click(screen.getByRole('button', { name: /Add.*Requirement/i }))
    expect(toast.error).toHaveBeenLastCalledWith('Please provide a category')
    await userEvent.type(screen.getByLabelText('Category :'), 'Exp')
    await userEvent.click(screen.getByRole('button', { name: /Add.*Requirement/i }))
    expect(toast.error).toHaveBeenLastCalledWith('Please write description')
    await userEvent.type(screen.getByLabelText('Description :'), '3 years')
    await userEvent.click(screen.getByRole('button', { name: /Add.*Requirement/i }))
    expect(probe.requirement).toEqual([{ type: 'optional', category: 'Exp', description: '3 years' }])
    expect(toast.success).toHaveBeenCalledWith('requirement is successfully added')

    await userEvent.click(screen.getByRole('button', { name: 'Responsibilities' }))
    await userEvent.type(screen.getByLabelText('Category :'), 'Ops')
    // NOTE: the responsibility description textarea has no id, so its label is unassociated (a11y bug in source)
    const boxes = screen.getAllByRole('textbox')
    await userEvent.type(boxes[boxes.length - 1], 'On-call')
    await userEvent.click(screen.getByRole('button', { name: /Add.*Responsibilit/i }))
    expect(probe.responsibilities).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Skills' }))
    await userEvent.click(screen.getByRole('button', { name: /Add.*Skill/i }))
    expect(toast.error).toHaveBeenLastCalledWith('Please provide a category')
    await userEvent.type(screen.getByLabelText('Category :'), 'Lang')
    await userEvent.type(screen.getByLabelText('Description :'), 'Go')
    await userEvent.click(screen.getByRole('button', { name: /Add.*Skill/i }))
    expect(probe.skills).toHaveLength(1)
  })

  it('adds a manual interview question', async () => {
    renderWithProviders(<Harness />, { preloadedState: store })
    await userEvent.click(screen.getByText(/Check this if you want/))
    await userEvent.click(screen.getByRole('button', { name: /Add a Question/ }))
    expect(toast.error).toHaveBeenLastCalledWith('Please provide a question')
    await userEvent.type(screen.getByLabelText('Question :'), 'Why?')
    await userEvent.type(screen.getByLabelText(/Reference answer/), 'Because')
    await userEvent.click(screen.getByRole('button', { name: /Add a Question/ }))
    expect(probe.interviewQA).toEqual([{ question: 'Why?', referenceAnswer: 'Because' }])
  })

  it('generates AI questions and adds the selected ones', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: { questions: JSON.stringify([{ question: 'Q1', referenceAnswer: 'A1' }, { question: 'Q2', referenceAnswer: 'A2' }]) } } })
    renderWithProviders(<Harness initial={{ jobDescription: 'Desc' }} />, { preloadedState: store })
    await userEvent.click(screen.getByText(/Check this if you want/))
    await userEvent.click(screen.getByRole('button', { name: 'Generate Questions' }))
    expect(await screen.findByText('Q1')).toBeInTheDocument()
    const addSelected = screen.getByRole('button', { name: 'Add Selected' })
    expect(addSelected).toBeDisabled()
    await userEvent.click(screen.getByLabelText('Select All'))
    await userEvent.click(addSelected)
    expect(probe.interviewQA).toHaveLength(2)
    expect(screen.queryByText('Q1')).not.toBeInTheDocument()
  })

  it('toggles single generated questions and handles object payloads', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: { questions: [{ question: 'Q1' }, { question: 'Q2' }] } } })
    renderWithProviders(<Harness initial={{ jobDescription: 'Desc' }} />, { preloadedState: store })
    await userEvent.click(screen.getByText(/Check this if you want/))
    await userEvent.click(screen.getByRole('button', { name: 'Generate Questions' }))
    await screen.findByText('Q1')
    const boxes = screen.getAllByRole('checkbox')
    await userEvent.click(boxes[2]) // first question
    await userEvent.click(boxes[2]) // untoggle
    await userEvent.click(boxes[3])
    await userEvent.click(screen.getByRole('button', { name: 'Add Selected' }))
    expect(probe.interviewQA).toEqual([{ question: 'Q2' }])
  })

  it('reports generation problems', async () => {
    renderWithProviders(<Harness />, { preloadedState: store })
    await userEvent.click(screen.getByText(/Check this if you want/))
    await userEvent.click(screen.getByRole('button', { name: 'Generate Questions' }))
    expect(toast.error).toHaveBeenLastCalledWith('Please write jobDescription')
    // with description but failing API
    renderWithProviders(<Harness initial={{ jobDescription: 'Desc' }} />, { preloadedState: store })
    await userEvent.click(screen.getAllByText(/Check this if you want/)[1])
    await userEvent.click(screen.getAllByRole('button', { name: 'Generate Questions' })[1])
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No questions were generated. Try again!'))
    expect(toast.error).toHaveBeenCalledWith('Something went wrong!')
  })
})
