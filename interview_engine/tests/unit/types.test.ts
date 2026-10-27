import { describe, it, expect } from 'vitest';
import { ScheduleInterviewRequest } from '../../src/types/interview.types';
import { scheduleInterview } from '../../src/types/candidateInfo.types';
import { InterviewCreatedNotificationSchema, InterviewStatusSchema, EventTypes } from '../../src/types/notification.types';
import { scheduleBody } from '../fixtures/interview';

describe('ScheduleInterviewRequest', () => {
  it('accepts a valid body and keeps unknown keys (loose)', () => {
    const r = ScheduleInterviewRequest.safeParse({ ...scheduleBody, extra: 1, allowedDuration: 20 });
    expect(r.success).toBe(true);
    expect((r.data as any).extra).toBe(1);
  });

  it('keeps unknown keys on question entries', () => {
    const body = { ...scheduleBody, job: { ...scheduleBody.job, interviewQA: [{ question: 'q', _id: 'x', id: 'y', other: 1 }] } };
    const r = ScheduleInterviewRequest.safeParse(body);
    expect(r.success).toBe(true);
    expect((r.data as any).job.interviewQA[0].other).toBe(1);
  });

  it.each([
    ['candidate', { candidate: undefined }],
    ['job', { job: undefined }],
    ['organization', { organization: undefined }],
    ['deadline', { deadline: undefined }],
    ['deadline type', { deadline: 123 }],
    ['allowedDuration type', { allowedDuration: '15' }],
    ['question text', { job: { id: 'j', title: 't', interviewQA: [{ referenceAnswer: 'r' }] } }],
  ])('rejects bad %s', (_n, patch) => {
    expect(ScheduleInterviewRequest.safeParse({ ...scheduleBody, ...patch }).success).toBe(false);
  });
});

describe('candidateInfo scheduleInterview schema', () => {
  it('requires a Date deadline and reference answers', () => {
    const ok = {
      candidate: { id: '1', email: 'a@b.c', name: 'n' },
      job: { id: 'j', title: 't', interviewQA: [{ question: 'q', referenceAnswer: 'r' }] },
      deadline: new Date(),
    };
    expect(scheduleInterview.safeParse(ok).success).toBe(true);
    expect(scheduleInterview.safeParse({ ...ok, deadline: '2030-01-01' }).success).toBe(false);
    expect(scheduleInterview.safeParse({ ...ok, job: { ...ok.job, interviewQA: [{ question: 'q' }] } }).success).toBe(false);
  });
});

describe('notification types', () => {
  it('EventTypes values', () => {
    expect(EventTypes.INTERVIEW_SCHEDULED).toBe('interview.scheduled');
    expect(EventTypes.INTERVIEW_CANCELLED).toBe('interview.cancelled');
    expect(EventTypes.ASSIGNMENT_CREATED).toBe('assignment.created');
    expect(EventTypes.ASSIGNMENT_GRADED).toBe('assignment.graded');
  });

  it('InterviewStatusSchema only accepts known statuses', () => {
    expect(InterviewStatusSchema.safeParse('NO_SHOW').success).toBe(true);
    expect(InterviewStatusSchema.safeParse('DONE').success).toBe(false);
  });

  it('InterviewCreatedNotificationSchema accepts string or Date deadline', () => {
    const n = {
      type: 't', interviewId: 'i', candidateId: 'c', candidateEmail: 'e', jobId: 'j', jobTitle: 'jt',
      organizationId: 'o', deadline: new Date(), totalQuestions: 1, status: 'SCHEDULED',
    };
    expect(InterviewCreatedNotificationSchema.safeParse(n).success).toBe(true);
    expect(InterviewCreatedNotificationSchema.safeParse({ ...n, deadline: 'x' }).success).toBe(true);
    expect(InterviewCreatedNotificationSchema.safeParse({ ...n, deadline: 5 }).success).toBe(false);
    expect(InterviewCreatedNotificationSchema.safeParse({ ...n, status: 'bad' }).success).toBe(false);
  });
});
