import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import reducer, * as s from '@/redux/features/job'
import { createMockStore } from '../../../helpers/mockStore'
import { runThunkCase, silenceConsole } from '../../../helpers/thunkHarness'

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))

beforeEach(silenceConsole)
afterEach(() => vi.restoreAllMocks())

const H = 'http://localhost:8080/api'

const cases = [
  { name: 'createJob', thunk: s.createJob, arg: { organizationId: 'o1', data: { t: 1 } }, method: 'post', url: `${H}/job/organization/o1`, body: { t: 1 }, data: { data: {} }, fallback: 'Job creation failed' },
  { name: 'getJobsByOrganization', thunk: s.getJobsByOrganization, arg: 'o1', method: 'get', url: `${H}/job/organization/o1`, data: { data: { jobs: [] } }, fallback: 'Failed fetching jobs' },
  { name: 'deleteJob', thunk: s.deleteJob, arg: 'j1', method: 'delete', url: `${H}/job/j1`, data: {}, payload: 'j1', fallback: 'Failed deleting job' },
  { name: 'exploreAllJobs', thunk: s.exploreAllJobs, method: 'get', url: `${H}/job/active-jobs`, data: { data: { jobs: [] } }, fallback: 'Failed fetching jobs' },
  { name: 'applyJob', thunk: s.applyJob, arg: 'j1', method: 'post', url: `${H}/job/j1/apply`, body: null, data: { data: {} }, fallback: 'Failed apply job' },
  { name: 'getAllAppliedJobs', thunk: s.getAllAppliedJobs, method: 'get', url: `${H}/job/user/applied`, data: { data: [] }, fallback: 'Failed fetching applied job' },
  { name: 'saveJob', thunk: s.saveJob, arg: 'j1', method: 'post', url: `${H}/job/j1/save`, body: null, data: { data: {} }, fallback: 'Failed save job' },
  { name: 'unsaveJob', thunk: s.unsaveJob, arg: 'j1', method: 'post', url: `${H}/job/j1/unsave`, body: null, data: {}, payload: 'j1', fallback: 'Failed unsave job' },
  { name: 'getAllSavedJobs', thunk: s.getAllSavedJobs, method: 'get', url: `${H}/job/user/saved`, data: { data: [] }, fallback: 'Failed fetching saved job' },
  { name: 'markAsShortListed', thunk: s.markAsShortListed, arg: { jobId: 'j1', data: { c: 1 } }, method: 'post', url: `${H}/job/j1/shortlist`, body: { c: 1 }, data: { data: {} }, fallback: 'Failed marking as shortlisted' },
  { name: 'markAsShortListedByAI', thunk: s.markAsShortListedByAI, arg: { jobId: 'j1', k: 5 }, method: 'get', url: `${H}/resume/j1/shortlist/5`, data: { data: [] }, fallback: 'Failed marking as shortlisted By AI' },
  { name: 'markAsFinalist', thunk: s.markAsFinalist, arg: { jobId: 'j1', data: { c: 1 } }, method: 'post', url: `${H}/job/j1/finalist`, body: { c: 1 }, data: { data: {} }, fallback: 'Failed marking as finalist' },
  { name: 'rejectCandidate', thunk: s.rejectCandidate, arg: { jobId: 'j1', status: 'REJ', data: { c: 1 } }, method: 'post', url: `${H}/job/j1/reject/status/REJ`, body: { c: 1 }, data: { data: {} }, fallback: 'Failed marking as finalist' },
] as const

describe('job thunks (request + error handling)', () => {
  for (const c of cases) {
    const h = runThunkCase(axios, c as any)
    it(`${c.name} success`, h.success)
    it(`${c.name} server error`, h.serverError)
    it(`${c.name} network error`, h.networkError)
  }
})

const base = () => reducer(undefined, { type: 'x' })
type St = ReturnType<typeof base>

describe('job reducers', () => {
  it('initial state', () => {
    const st = base()
    expect(st.myJobs).toEqual([])
    expect(st.createJobStatus).toBe('idle')
    expect(st.selectedOrgId).toBeNull()
  })

  it('plain setters', () => {
    expect(reducer(base(), s.setRejectCandidateStatus('error')).rejectCandidateStatus).toBe('error')
    expect(reducer(base(), s.setMarkShortListedByAiStatus('error')).markShortlistedByAiStatus).toBe('error')
    expect(reducer(base(), s.setSelectedOrgId('o')).selectedOrgId).toBe('o')
    expect(reducer(base(), s.setSelectedOrg({ a: 1 })).selectedOrg).toEqual({ a: 1 })
    expect(reducer(base(), s.setApplyJobStatus('success')).applyJobStatus).toBe('success')
    expect(reducer(base(), s.setGetAllJobStatus('success')).getAllJobsStatus).toBe('success')
    expect(reducer(base(), s.setApplyJobId('a')).applyJobId).toBe('a')
    expect(reducer(base(), s.setSaveJobId('a')).saveJobId).toBe('a')
    expect(reducer(base(), s.setRecruiterSelectedJob({ j: 1 })).recruitersSelectedJob).toEqual({ j: 1 })
    expect(reducer(base(), s.setCreateJobStatus('error')).createJobStatus).toBe('error')
    expect(reducer(base(), s.setMarkShortListedStatus('error')).markShortlistedStatus).toBe('error')
    expect(reducer(base(), s.setShortListedCandidate([1])).shortListedCandidate).toEqual([1])
    expect(reducer(base(), s.setPreviewedShortListedCandidate([2])).previewedShortListedCandidate).toEqual([2])
  })

  const arg = undefined as any
  const rid = 'rid'

  it('createJob', () => {
    expect(reducer(base(), s.createJob.pending(rid, arg)).createJobStatus).toBe('pending')
    expect(reducer(base(), s.createJob.rejected(null, rid, arg)).createJobStatus).toBe('error')
    const st = reducer(base(), s.createJob.fulfilled({ data: { _id: 'n' } }, rid, arg))
    expect(st.myJobs).toEqual([{ _id: 'n' }])
    expect(st.createJobStatus).toBe('success')
  })
  it('getJobsByOrganization', () => {
    expect(reducer(base(), s.getJobsByOrganization.pending(rid, arg)).fetchJobStatus).toBe('pending')
    expect(reducer(base(), s.getJobsByOrganization.rejected(null, rid, arg)).fetchJobStatus).toBe('error')
    const st = reducer(base(), s.getJobsByOrganization.fulfilled({ data: { jobs: [{ _id: 'a' }] } }, rid, arg))
    expect(st.myJobs).toEqual([{ _id: 'a' }])
    expect(st.fetchJobStatus).toBe('success')
  })
  it('deleteJob.fulfilled removes the job', () => {
    const st = reducer({ ...base(), myJobs: [{ _id: 'a' }, { _id: 'b' }] }, s.deleteJob.fulfilled('a', rid, 'a'))
    expect(st.myJobs).toEqual([{ _id: 'b' }])
  })
  it('exploreAllJobs', () => {
    expect(reducer(base(), s.exploreAllJobs.pending(rid, arg)).getAllJobsStatus).toBe('pending')
    expect(reducer(base(), s.exploreAllJobs.rejected(null, rid, arg)).getAllJobsStatus).toBe('error')
    const st = reducer(base(), s.exploreAllJobs.fulfilled({ data: { jobs: [1] } }, rid, arg))
    expect(st.exploreJobs).toEqual([1])
    expect(st.getAllJobsStatus).toBe('success')
  })
  it('applyJob', () => {
    const start: St = { ...base(), applyJobId: 'x' }
    expect(reducer(start, s.applyJob.pending(rid, 'x')).applyJobStatus).toBe('pending')
    const rej = reducer(start, s.applyJob.rejected(null, rid, 'x'))
    expect(rej.applyJobStatus).toBe('error')
    expect(rej.applyJobId).toBeNull()
    const ok = reducer(start, s.applyJob.fulfilled({ data: { _id: 'j' } }, rid, 'x'))
    expect(ok.appliedJobs).toEqual([{ _id: 'j' }])
    expect(ok.applyJobStatus).toBe('success')
    expect(ok.applyJobId).toBeNull()
  })
  it('getAllAppliedJobs', () => {
    expect(reducer(base(), s.getAllAppliedJobs.pending(rid, arg)).getAllJobsStatus).toBe('pending')
    expect(reducer(base(), s.getAllAppliedJobs.rejected(null, rid, arg)).getAllJobsStatus).toBe('error')
    const st = reducer(base(), s.getAllAppliedJobs.fulfilled({ data: [1] }, rid, arg))
    expect(st.appliedJobs).toEqual([1])
    expect(st.getAllJobsStatus).toBe('success')
  })
  it('saveJob', () => {
    const start: St = { ...base(), saveJobId: 'x' }
    expect(reducer(start, s.saveJob.pending(rid, 'x')).saveJobStatus).toBe('pending')
    const rej = reducer(start, s.saveJob.rejected(null, rid, 'x'))
    expect(rej.saveJobStatus).toBe('error')
    expect(rej.saveJobId).toBeNull()
    const ok = reducer(start, s.saveJob.fulfilled({ data: { _id: 'j' } }, rid, 'x'))
    expect(ok.savedJobs).toEqual([{ _id: 'j' }])
    expect(ok.saveJobStatus).toBe('success')
    expect(ok.saveJobId).toBeNull()
  })
  it('saveJob.fulfilled tolerates missing savedJobs/payload data', () => {
    const start: any = { ...base(), savedJobs: undefined }
    const ok = reducer(start, s.saveJob.fulfilled({} as any, rid, 'x'))
    expect(ok.saveJobStatus).toBe('success')
  })
  it('unsaveJob', () => {
    const start: St = { ...base(), saveJobId: 'x', savedJobs: [{ _id: 'a' }, { _id: 'b' }] }
    expect(reducer(start, s.unsaveJob.pending(rid, 'a')).saveJobStatus).toBe('pending')
    const rej = reducer(start, s.unsaveJob.rejected(null, rid, 'a'))
    expect(rej.saveJobStatus).toBe('error')
    expect(rej.saveJobId).toBeNull()
    const ok = reducer(start, s.unsaveJob.fulfilled('a', rid, 'a'))
    expect(ok.savedJobs).toEqual([{ _id: 'b' }])
    expect(ok.saveJobStatus).toBe('success')
    expect(ok.saveJobId).toBeNull()
  })
  it('getAllSavedJobs', () => {
    expect(reducer(base(), s.getAllSavedJobs.pending(rid, arg)).getAllJobsStatus).toBe('pending')
    expect(reducer(base(), s.getAllSavedJobs.rejected(null, rid, arg, { message: 'm' })).getAllJobsStatus).toBe('error')
    const st = reducer(base(), s.getAllSavedJobs.fulfilled({ data: [1] }, rid, arg))
    expect(st.savedJobs).toEqual([1])
    expect(st.getAllJobsStatus).toBe('success')
  })
  it('markAsShortListed', () => {
    expect(reducer(base(), s.markAsShortListed.pending(rid, arg))).toMatchObject({ markShortlistedStatus: 'pending', markShortlistedByAiStatus: 'pending' })
    expect(reducer(base(), s.markAsShortListed.rejected(null, rid, arg))).toMatchObject({ markShortlistedStatus: 'error', markShortlistedByAiStatus: 'error' })
    const st = reducer(base(), s.markAsShortListed.fulfilled({ data: { id: 'job' } }, rid, arg))
    expect(st).toMatchObject({ recruitersSelectedJob: { id: 'job' }, markShortlistedStatus: 'success', markShortlistedByAiStatus: 'success' })
  })
  it('markAsShortListedByAI', () => {
    expect(reducer(base(), s.markAsShortListedByAI.pending(rid, arg)).markShortlistedStatus).toBe('pending')
    expect(reducer(base(), s.markAsShortListedByAI.rejected(null, rid, arg)).markShortlistedStatus).toBe('error')
    const st = reducer(base(), s.markAsShortListedByAI.fulfilled({ data: [1, 2] }, rid, arg))
    expect(st.previewedShortListedCandidate).toEqual([1, 2])
    expect(st.markShortlistedStatus).toBe('success')
  })
  it('markAsFinalist', () => {
    expect(reducer(base(), s.markAsFinalist.pending(rid, arg))).toMatchObject({ markFinalistStatus: 'pending', markShortlistedByAiStatus: 'pending' })
    const rej = reducer(base(), s.markAsFinalist.rejected(null, rid, arg))
    expect(rej.markFinalistStatus).toBe('error')
    expect(rej.markShortlistedByAiStatus).toBe('idle')
    const st = reducer(base(), s.markAsFinalist.fulfilled({ data: { id: 'job' } }, rid, arg))
    expect(st).toMatchObject({ recruitersSelectedJob: { id: 'job' }, markFinalistStatus: 'success' })
  })
  it('rejectCandidate', () => {
    expect(reducer(base(), s.rejectCandidate.pending(rid, arg)).rejectCandidateStatus).toBe('pending')
    expect(reducer(base(), s.rejectCandidate.rejected(null, rid, arg)).rejectCandidateStatus).toBe('error')
    const st = reducer(base(), s.rejectCandidate.fulfilled({ data: { id: 'job' } }, rid, arg))
    expect(st).toMatchObject({ recruitersSelectedJob: { id: 'job' }, rejectCandidateStatus: 'success' })
  })

  it('selectors', () => {
    const store = createMockStore({ job: {
      exploreJobs: [1], appliedJobs: [2], savedJobs: [3], myJobs: [4], applyJobId: 'a', saveJobId: 's',
      createJobStatus: 'success', getAllJobsStatus: 'pending', fetchJobStatus: 'error', applyJobStatus: 'success',
      markShortlistedStatus: 'error', saveJobStatus: 'pending', selectedOrgId: 'oid', selectedOrg: { n: 1 },
      recruitersSelectedJob: { r: 1 }, shortListedCandidate: [5], previewedShortListedCandidate: [6],
      markShortlistedByAiStatus: 'success', markFinalistStatus: 'error', rejectCandidateStatus: 'pending',
    } })
    const st = store.getState()
    expect(s.exploreJobs(st)).toEqual([1])
    expect(s.appliedJobs(st)).toEqual([2])
    expect(s.savedJobs(st)).toEqual([3])
    expect(s.myJobs(st)).toEqual([4])
    expect(s.applyJobId(st)).toBe('a')
    expect(s.saveJobId(st)).toBe('s')
    expect(s.createJobStatus(st)).toBe('success')
    expect(s.getAllJobsStatus(st)).toBe('pending')
    expect(s.fetchJobStatus(st)).toBe('error')
    expect(s.applyJobStatus(st)).toBe('success')
    expect(s.markShortlistedStatus(st)).toBe('error')
    expect(s.saveJobStatus(st)).toBe('pending')
    expect(s.selectedOrgId(st)).toBe('oid')
    expect(s.selectedOrg(st)).toEqual({ n: 1 })
    expect(s.recruitersSelectedJob(st)).toEqual({ r: 1 })
    expect(s.shortListedCandidate(st)).toEqual([5])
    expect(s.previewedShortListedCandidate(st)).toEqual([6])
    expect(s.markShortlistedByAiStatus(st)).toBe('success')
    expect(s.markFinalistStatus(st)).toBe('error')
    expect(s.rejectCandidateStatus(st)).toBe('pending')
  })
})
