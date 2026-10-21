import { describe, expect, it } from 'vitest'
import { route } from '@/lib/demo/mockApi'

const call = (method: string, path: string, body?: any) => route({ method, path, body })

describe('demo mock API', () => {
  it('returns the candidate profile wrapped in { data }', () => {
    const { status, data } = call('get', 'user/profile')
    expect(status).toBe(200)
    expect(data.data.user.roles).toContain('USER')
    expect(data.data.resumeData.skills.technical.length).toBeGreaterThan(0)
  })

  it('lists active jobs', () => {
    const { data } = call('get', 'job/active-jobs')
    expect(data.data.jobs.length).toBeGreaterThan(0)
  })

  it('save / unsave a job updates the saved list', () => {
    call('post', 'job/job-2/save')
    expect(call('get', 'job/user/saved').data.data.map((j: any) => j._id)).toContain('job-2')
    call('post', 'job/job-2/unsave')
    expect(call('get', 'job/user/saved').data.data.map((j: any) => j._id)).not.toContain('job-2')
  })

  it('applying to a job adds it to applied jobs', () => {
    call('post', 'job/job-4/apply')
    expect(call('get', 'job/user/applied').data.data.map((j: any) => j._id)).toContain('job-4')
  })

  it('creating a job for an organization makes it visible in that org', () => {
    call('post', 'job/organization/org-northwind', { basic: { title: 'QA Engineer', salaryFrom: '90', salaryTo: '110' } })
    const titles = call('get', 'job/organization/org-northwind').data.data.jobs.map((j: any) => j.title)
    expect(titles).toContain('QA Engineer')
  })

  it('shortlisting moves an applicant to SHORTLISTED', () => {
    call('post', 'job/job-1/shortlist', { candidateIds: ['u-cand-3'] })
    const app = call('get', 'job/job-1').data.data.applications.find((a: any) => a.candidateId === 'u-cand-3')
    expect(app.status).toBe('SHORTLISTED')
  })

  it('returns an interview evaluation and falls back to empty data for unknown routes', () => {
    expect(call('get', 'interviews/int-2/evaluation').data.data.perQuestion.length).toBeGreaterThan(0)
    expect(call('get', 'nope/nothing').data).toEqual({ data: [] })
  })
})
