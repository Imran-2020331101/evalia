import axios, { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { DEMO, DEMO_RECRUITER_EMAIL } from './config'
import * as fx from './fixtures'

// Mutable in-memory state so save / apply / create actions feel real within a session.
const state = {
  orgs: [...fx.organizations],
  jobs: fx.jobs.map((j) => ({ ...j, applications: [...j.applications] })),
  appliedIds: new Set<string>(['job-1']),
  savedIds: new Set<string>(['job-3']),
  savedCourses: [fx.courses[0]] as any[],
  notifications: fx.notifications.map((n) => ({ ...n })),
  user: null as any,
}

const ok = (data: any) => ({ status: 200, data })
const readCookie = (name: string) =>
  typeof document === 'undefined'
    ? ''
    : decodeURIComponent(document.cookie.split('; ').find((c) => c.startsWith(name + '='))?.split('=')[1] ?? '')

const isRecruiter = () => readCookie('userEmail') === DEMO_RECRUITER_EMAIL
const currentUser = () => {
  if (!state.user || state.user.user.email !== readCookie('userEmail')) {
    const base = isRecruiter() ? fx.recruiterUser : fx.candidateUser
    state.user = JSON.parse(JSON.stringify(base))
  }
  return state.user
}
const jobById = (id: string) => state.jobs.find((j) => j._id === id)
const myOrgJobs = (orgId: string) => state.jobs.filter((j) => j.company.OrganizationId === orgId)

type Req = { method: string; path: string; body: any }

export function route({ method, path, body }: Req): { status: number; data: any } {
  let m: RegExpMatchArray | null

  // ----- user / orgs -----
  if (path === 'user/profile') return ok({ data: currentUser() })
  if (path === 'user/update/details') {
    currentUser().user = { ...currentUser().user, ...body }
    return ok({ data: currentUser().user })
  }
  if ((m = path.match(/^user\/([^/]+)\/single$/))) return ok({ data: fx.usersById[m[1]] ?? fx.usersById['u-candidate'] })
  if (path === 'organization/all') return ok({ data: state.orgs.filter((o) => o.ownerEmail === DEMO_RECRUITER_EMAIL) })
  if (path === 'organization/new') {
    const org = { ...body, id: 'org-' + Date.now(), ownerEmail: DEMO_RECRUITER_EMAIL, verified: false, createdAt: new Date().toISOString() }
    state.orgs.push(org)
    return ok(org)
  }
  if ((m = path.match(/^organization\/([^/]+)$/))) {
    const org = state.orgs.find((o) => o.id === m![1])
    if (method === 'delete') state.orgs = state.orgs.filter((o) => o.id !== m![1])
    if (method === 'patch' && org) Object.assign(org, body)
    return ok(method === 'patch' ? { data: org } : org)
  }

  // ----- jobs -----
  if (path === 'job/active-jobs') return ok({ data: { jobs: state.jobs } })
  if (path === 'job/user/applied') return ok({ data: state.jobs.filter((j) => state.appliedIds.has(j._id)) })
  if (path === 'job/user/saved') return ok({ data: state.jobs.filter((j) => state.savedIds.has(j._id)) })
  if (path === 'job/suggestions') return ok({ data: ['job-1', 'job-3', 'job-4'].map((jobId) => ({ jobId })) })
  if (path === 'job/generate/interview-questions') {
    return ok({
      data: [
        { question: 'Walk me through a system you designed end to end.', referenceAnswer: 'Cover requirements, trade-offs, scaling and failure handling.' },
        { question: 'How do you debug a production latency spike?', referenceAnswer: 'Metrics, traces, recent deploys, then bisect.' },
        { question: 'Describe a disagreement on a technical decision and how you resolved it.', referenceAnswer: 'Data-driven discussion and a documented decision.' },
      ],
    })
  }
  if ((m = path.match(/^job\/organization\/([^/]+)$/))) {
    if (method === 'post') {
      const job: any = { _id: 'job-' + Date.now(), status: 'ACTIVE', applications: [], createdAt: new Date().toISOString(), company: { OrganizationId: m[1] }, ...flattenJob(body) }
      state.jobs.unshift(job)
      return ok({ data: job })
    }
    return ok({ data: { jobs: myOrgJobs(m[1]) } })
  }
  if ((m = path.match(/^job\/([^/]+)\/(apply|save|unsave)$/))) {
    const job = jobById(m[1])
    if (m[2] === 'apply') state.appliedIds.add(m[1])
    if (m[2] === 'save') state.savedIds.add(m[1])
    if (m[2] === 'unsave') state.savedIds.delete(m[1])
    return ok({ data: job })
  }
  if ((m = path.match(/^job\/([^/]+)\/(shortlist|finalist)$/))) {
    const job = jobById(m[1])
    const ids: string[] = body?.candidateIds ?? []
    job?.applications.forEach((a: any) => ids.includes(a.candidateId) && (a.status = m![2] === 'shortlist' ? 'SHORTLISTED' : 'FINALIST'))
    return ok({ data: job })
  }
  if ((m = path.match(/^job\/([^/]+)\/reject\/status\/[^/]+$/))) {
    const job = jobById(m[1])
    const ids: string[] = body?.candidateIds ?? []
    if (job) job.applications = job.applications.filter((a: any) => !ids.includes(a.candidateId))
    return ok({ data: job })
  }
  if ((m = path.match(/^job\/([^/]+)$/))) {
    if (method === 'delete') {
      state.jobs = state.jobs.filter((j) => j._id !== m![1])
      return ok({ data: null })
    }
    return ok({ data: jobById(m[1]) })
  }

  // ----- resume / matching -----
  if (path === 'resume/extract') return ok({ data: fx.candidateUser.resumeData })
  if (path === 'resume/save') {
    currentUser().resumeData = body
    return ok(body)
  }
  if (path.startsWith('resume/shortlist/')) return ok({ data: fx.matchedCandidates })
  if (/^resume\/[^/]+\/shortlist\//.test(path)) return ok({ data: fx.matchedCandidates.map((c) => ({ ...c, candidateId: c['candidate-id'] })) })
  if (path === 'resume/upload') return ok({ data: { downloadUrl: '' } })
  if ((m = path.match(/^compatibility\/(.+)$/))) return ok({ data: fx.compatibility })

  // ----- interviews -----
  if (path === 'interviews' || path === 'interviews/') return ok({ data: fx.interviews })
  if (/^interviews\/job\/[^/]+\/candidate\/[^/]+$/.test(path)) return ok({ data: fx.interviews[1] })
  if ((m = path.match(/^interviews\/([^/]+)\/evaluation$/))) return ok({ data: fx.evaluation })
  if ((m = path.match(/^interviews\/([^/]+)\/transcript$/))) return ok({ data: {} })
  if ((m = path.match(/^interviews\/([^/]+)$/))) return ok({ data: { ...fx.interviewDetail, id: m[1] } })

  // ----- courses -----
  if (path === 'course/suggestions') return ok({ data: { courses: fx.courses } })
  if (path === 'course/saved/all') return ok({ data: [{ savedCourses: state.savedCourses }] })
  if (path === 'course/save') {
    if (!state.savedCourses.some((c) => c.videoId === body.videoId)) state.savedCourses.push(body)
    return ok({ data: { savedCourses: state.savedCourses } })
  }
  if ((m = path.match(/^course\/delete\/(.+)$/))) {
    state.savedCourses = state.savedCourses.filter((c) => c.videoId !== m![1])
    return ok({ data: { savedCourses: state.savedCourses } })
  }

  // ----- notifications -----
  if (path === 'notifications' || path === 'notifications/') return ok({ data: state.notifications })
  if (path === 'notifications/read-all') {
    state.notifications.forEach((n) => (n.isRead = true))
    return ok({ data: true })
  }
  if ((m = path.match(/^notifications\/([^/]+)\/read$/))) {
    const n = state.notifications.find((x) => x._id === m![1])
    if (n) n.isRead = true
    return ok({ data: n })
  }

  // Profile / cover photo uploads: echo a bundled image so the UI updates.
  if (path === 'user/update/profile-photo' || path === 'user/update/cover-photo') return ok({ url: '/evalia-short.png' })
  if (/^organization\/[^/]+\/profile-photo$/.test(path)) return ok({ url: '/evalia-short.png' })

  return ok({ data: [] })
}

// The create-job form posts a nested shape; the list views expect it flattened.
function flattenJob(body: any) {
  const b = body?.basic ?? {}
  return {
    title: b.title,
    jobDescription: b.jobDescription,
    jobLocation: b.jobLocation,
    jobType: b.jobType,
    workPlaceType: b.workPlaceType,
    employmentLevel: b.employmentLevelType,
    deadline: b.deadline,
    salary: { from: b.salaryFrom, to: b.salaryTo },
    requirements: body?.requirement ?? [],
    responsibilities: body?.responsibility ?? [],
    skills: body?.skill ?? [],
    interviewQA: body?.interviewQA ?? [],
  }
}

function parseBody(raw: any) {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const BACKEND = /^\s*https?:\/\/localhost:(8080|4000|5000|7000)\/(api\/)?/

export function installDemoApi() {
  if (!DEMO || typeof window === 'undefined' || (window as any).__evaliaDemo) return
  ;(window as any).__evaliaDemo = true

  const realAdapter = axios.getAdapter(axios.defaults.adapter as any)

  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const url = String(config.url ?? '')
    if (!BACKEND.test(url)) return realAdapter(config)
    const path = url.replace(BACKEND, '').split('?')[0].replace(/\/$/, '') || ''
    await new Promise((r) => setTimeout(r, 180)) // feel like a network call
    const { status, data } = route({ method: (config.method ?? 'get').toLowerCase(), path, body: parseBody(config.data) })
    return { data, status, statusText: 'OK', headers: {}, config, request: {} }
  }
  axios.defaults.adapter = adapter

  const realFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (!BACKEND.test(url)) return realFetch(input, init)
    const path = url.replace(BACKEND, '').split('?')[0]
    const { status, data } = route({ method: (init?.method ?? 'get').toLowerCase(), path, body: typeof init?.body === 'string' ? parseBody(init.body) : undefined })
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  }
}
