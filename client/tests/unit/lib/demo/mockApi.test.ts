import { describe, expect, it } from 'vitest'
import { route } from '@/lib/demo/mockApi'

const call = (method: string, path: string, body?: any) => route({ method, path, body })

describe('mockApi route (node, no cookies)', () => {
  it('looks up users by id with fallback', () => {
    expect(call('get', 'user/u-candidate/single').data.data).toBeTruthy()
    expect(call('get', 'user/nope/single').data.data).toEqual(call('get', 'user/u-candidate/single').data.data)
  })

  it('organization CRUD', () => {
    expect(call('get', 'organization/all').data.data.length).toBeGreaterThan(0)
    const created = call('post', 'organization/new', { name: 'NewCo' }).data
    expect(created).toMatchObject({ name: 'NewCo', verified: false })
    const patched = call('patch', `organization/${created.id}`, { name: 'Renamed' }).data
    expect(patched.data.name).toBe('Renamed')
    expect(call('get', `organization/${created.id}`).data.name).toBe('Renamed')
    call('delete', `organization/${created.id}`)
    expect(call('get', `organization/${created.id}`).data).toBeUndefined()
    // patch on unknown org -> data undefined
    expect(call('patch', 'organization/missing', { a: 1 }).data.data).toBeUndefined()
  })

  it('job suggestions and generated interview questions', () => {
    expect(call('get', 'job/suggestions').data.data).toEqual([{ jobId: 'job-1' }, { jobId: 'job-3' }, { jobId: 'job-4' }])
    expect(call('post', 'job/generate/interview-questions').data.data).toHaveLength(3)
  })

  it('creating a job with no body flattens to defaults', () => {
    const job = call('post', 'job/organization/org-x').data.data
    expect(job.requirements).toEqual([])
    expect(job.skills).toEqual([])
    expect(job.company.OrganizationId).toBe('org-x')
    const full = call('post', 'job/organization/org-x', {
      basic: { title: 'T', jobDescription: 'd', jobLocation: 'l', jobType: 'FT', workPlaceType: 'R', employmentLevelType: 'MID', deadline: 'x', salaryFrom: 1, salaryTo: 2 },
      requirement: ['r'], responsibility: ['p'], skill: ['s'], interviewQA: ['q'],
    }).data.data
    expect(full).toMatchObject({ title: 'T', employmentLevel: 'MID', salary: { from: 1, to: 2 }, requirements: ['r'], responsibilities: ['p'], skills: ['s'], interviewQA: ['q'] })
  })

  it('lists jobs for an org', () => {
    const jobs = call('get', 'job/organization/org-northwind').data.data.jobs
    expect(jobs.every((j: any) => j.company.OrganizationId === 'org-northwind')).toBe(true)
  })

  it('apply/save/unsave on unknown job return undefined data', () => {
    expect(call('post', 'job/ghost/apply').data.data).toBeUndefined()
  })

  it('finalist, shortlist with missing body and missing job', () => {
    call('post', 'job/job-1/finalist', { candidateIds: ['u-cand-3'] })
    const app = call('get', 'job/job-1').data.data.applications.find((a: any) => a.candidateId === 'u-cand-3')
    expect(app.status).toBe('FINALIST')
    expect(call('post', 'job/job-1/shortlist').status).toBe(200)
    expect(call('post', 'job/ghost/shortlist', {}).data.data).toBeUndefined()
  })

  it('reject removes applications; missing job tolerated', () => {
    const before = call('get', 'job/job-1').data.data.applications.length
    const id = call('get', 'job/job-1').data.data.applications[0]?.candidateId
    call('post', 'job/job-1/reject/status/REJECTED', { candidateIds: [id] })
    expect(call('get', 'job/job-1').data.data.applications.length).toBe(before - 1)
    expect(call('post', 'job/ghost/reject/status/X').data.data).toBeUndefined()
    // no body
    call('post', 'job/job-1/reject/status/X')
  })

  it('delete job', () => {
    const j = call('post', 'job/organization/org-del', { basic: { title: 'Del' } }).data.data
    expect(call('delete', `job/${j._id}`).data).toEqual({ data: null })
    expect(call('get', `job/${j._id}`).data.data).toBeUndefined()
  })

  it('resume endpoints', () => {
    expect(call('get', 'resume/extract').data.data.skills).toBeTruthy()
    const body = { industry: 'X' }
    expect(call('post', 'resume/save', body).data).toEqual(body)
    expect(call('get', 'resume/shortlist/abc').data.data.length).toBeGreaterThan(0)
    const m = call('get', 'resume/job-1/shortlist/3').data.data
    expect(m[0].candidateId).toBe(m[0]['candidate-id'])
    expect(call('post', 'resume/upload').data).toEqual({ data: { downloadUrl: '' } })
    expect(call('get', 'compatibility/xyz').data.data).toBeTruthy()
  })

  it('interview endpoints', () => {
    expect(call('get', 'interviews').data.data.length).toBe(3)
    expect(call('get', 'interviews/').data.data.length).toBe(3)
    expect(call('get', 'interviews/job/j/candidate/c').data.data.id).toBe('int-2')
    expect(call('get', 'interviews/int-2/evaluation').data.data.interviewId).toBe('int-2')
    expect(call('get', 'interviews/int-2/transcript').data).toEqual({ data: {} })
    expect(call('get', 'interviews/abc').data.data.id).toBe('abc')
  })

  it('course endpoints', () => {
    expect(call('get', 'course/suggestions').data.data.courses.length).toBeGreaterThan(0)
    const initial = call('get', 'course/saved/all').data.data[0].savedCourses.length
    const c = { videoId: 'v-new', title: 'x' }
    expect(call('post', 'course/save', c).data.data.savedCourses.length).toBe(initial + 1)
    // saving duplicate is idempotent
    expect(call('post', 'course/save', c).data.data.savedCourses.length).toBe(initial + 1)
    expect(call('delete', 'course/delete/v-new').data.data.savedCourses.length).toBe(initial)
  })

  it('notification endpoints', () => {
    expect(call('get', 'notifications').data.data.length).toBe(3)
    expect(call('get', 'notifications/').data.data.length).toBe(3)
    expect(call('patch', 'notifications/n1/read').data.data.isRead).toBe(true)
    expect(call('patch', 'notifications/zzz/read').data.data).toBeUndefined()
    call('patch', 'notifications/read-all')
    expect(call('get', 'notifications').data.data.every((n: any) => n.isRead)).toBe(true)
  })

  it('photo uploads echo a url', () => {
    for (const p of ['user/update/profile-photo', 'user/update/cover-photo', 'organization/o1/profile-photo']) {
      expect(call('post', p).data).toEqual({ url: '/evalia-short.png' })
    }
  })

  it('unknown paths fall back to empty data', () => {
    expect(call('get', 'totally/unknown')).toEqual({ status: 200, data: { data: [] } })
  })
})
