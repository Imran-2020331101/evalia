import { describe, expect, it } from 'vitest'
import * as fx from '@/lib/demo/fixtures'
import { DEMO_CANDIDATE_EMAIL, DEMO_RECRUITER_EMAIL } from '@/lib/demo/config'

describe('demo fixtures', () => {
  it('candidate and recruiter users use demo emails', () => {
    expect(fx.candidateUser.user.email).toBe(DEMO_CANDIDATE_EMAIL)
    expect(fx.recruiterUser.user.email).toBe(DEMO_RECRUITER_EMAIL)
  })
  it('organizations have ids and owner emails', () => {
    expect(fx.organizations.length).toBeGreaterThan(0)
    for (const o of fx.organizations) {
      expect(o.id).toBeTruthy()
      expect(o.ownerEmail).toBeTruthy()
    }
  })
  it('jobs have unique ids, company org id and applications array', () => {
    const ids = fx.jobs.map((j) => j._id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const j of fx.jobs) {
      expect(j.company.OrganizationId).toBeTruthy()
      expect(Array.isArray(j.applications)).toBe(true)
    }
  })
  it('notifications, interviews, courses, matched candidates are non-empty', () => {
    expect(fx.notifications.length).toBeGreaterThan(0)
    expect(fx.interviews.length).toBeGreaterThan(1)
    expect(fx.courses.length).toBeGreaterThan(0)
    expect(fx.matchedCandidates.length).toBeGreaterThan(0)
  })
  it('exposes detail, evaluation, compatibility and user lookup', () => {
    expect(fx.interviewDetail.questionsAnswers.length).toBeGreaterThan(0)
    expect(fx.evaluation).toBeTruthy()
    expect(fx.compatibility).toBeTruthy()
    expect(fx.usersById['u-candidate']).toBeTruthy()
  })
  it('relative-date helpers yield valid ISO dates', () => {
    for (const n of fx.notifications) expect(Number.isNaN(Date.parse(n.createdAt))).toBe(false)
  })
})
