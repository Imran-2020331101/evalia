import { describe, it, expect, beforeAll } from 'vitest';
import { ROOT, read } from '../lib/contract.js';

/**
 * Producers (job-service, interview_engine) publish to RabbitMQ via sendNotification(payload, queue).
 * The notification-service consumes "notifications" (in-app) and "email-notification" (mail).
 * Schemas are imported from notification-service source (zod only).
 */
const mailInvite = await import(`${ROOT}/notification-service/src/mail/types/interview-invitation.payload.ts`);
const mailReject = await import(`${ROOT}/notification-service/src/mail/types/rejection-mail.type.ts`);
const inappTypes = await import(`${ROOT}/notification-service/src/in-app/types/notification.types.ts`);
const interviewTypes = await import(`${ROOT}/notification-service/src/in-app/types/interviewNotifications.types.ts`);

const enumValues = (src: string): Record<string, string> => {
  const body = /enum EventTypes\s*\{([\s\S]*?)\n\}/.exec(src)?.[1] ?? '';
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/^\s*([A-Z_]+)\s*=\s*"([^"]+)"/gm)) out[m[1]] = m[2];
  return out;
};

const consumed = [...read('notification-service/src/events/messageBroker.ts').matchAll(/channel\.consume\("([^"]+)"/g)].map((m) => m[1]);
const publishedBy = (rel: string) =>
  [...read(rel).matchAll(/sendNotification\([^;]*?,\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);

describe('queue names', () => {
  it('notification-service consumes notifications + email-notification', () => {
    expect(consumed.sort()).toEqual(['email-notification', 'notifications']);
  });
  it('queue is asserted before consumption', () => {
    const src = read('notification-service/src/events/messageBroker.ts');
    for (const q of consumed) expect(src).toContain(`assertQueue("${q}"`);
  });
  it('applicationService (job-service) publishes only to consumed queues', () => {
    for (const q of publishedBy('job-service/src/services/applicationService.ts')) expect(consumed).toContain(q);
  });
  it('interview_engine publishes only to consumed queues', () => {
    for (const q of publishedBy('interview_engine/src/controllers/InterviewController.ts')) expect(consumed).toContain(q);
  });
  it('MISMATCH: jobService.ts publishes rejection mails to "email-notifications" (plural) - nobody consumes it', () => {
    const queues = publishedBy('job-service/src/services/jobService.ts');
    expect(queues).toContain('email-notifications');
    expect(consumed).not.toContain('email-notifications');
  });
  it('MISMATCH (config): producers and consumer hard-code amqp://localhost:5672 (no env override)', () => {
    expect(read('job-service/src/utils/notify.ts')).toContain("amqp://localhost:5672");
    expect(read('notification-service/src/events/messageBroker.ts')).toContain("amqp://localhost:5672");
  });
});

describe('event type enums', () => {
  const consumer = enumValues(read('notification-service/src/events/eventTypes.ts'));
  const job = enumValues(read('job-service/src/types/notifications.types.ts'));
  const iv = enumValues(read('interview_engine/src/types/notification.types.ts'));

  it('every job-service event type is known to notification-service', () => {
    expect(Object.keys(job).length).toBeGreaterThan(5);
    for (const [k, v] of Object.entries(job)) expect(consumer[k], k).toBe(v);
  });
  it('every interview_engine event type is known to notification-service', () => {
    for (const [k, v] of Object.entries(iv)) expect(consumer[k], k).toBe(v);
  });
  it('mail handler switch only handles types job-service can emit', () => {
    const handled = [...read('notification-service/src/mail/handlers/mail-notification.handler.ts').matchAll(/case '([^']+)'/g)].map((m) => m[1]);
    for (const t of handled) expect(Object.values(job)).toContain(t);
  });
  it('in-app handler has a case for every in-app type producers use', () => {
    const src = read('notification-service/src/in-app/handlers/inapp-notification.handler.ts');
    for (const k of ['NEW_JOB_APPLICATION', 'INTERVIEW_SCHEDULED', 'JOB_POSTING_CREATED']) {
      expect(src).toContain(`case EventTypes.${k}`);
    }
  });
});

describe('payload shapes: job-service -> email-notification', () => {
  const base = {
    candidateId: 'c1', candidateName: 'Cand', candidateEmail: 'cand@x.io', jobTitle: 'Dev',
    OrganizationId: 'o1', OrganizationName: 'Acme', OrganizationEmail: 'hr@acme.io',
  };

  it('shortlisted payload (sendInterviewInvitation) satisfies InterviewInvitationPayloadSchema', () => {
    const payload = {
      type: 'job.application.shortlisted', ...base, deadline: new Date().toISOString(),
      guideLink: 'https://example.com/guide', interviewLink: 'https://app.evalia.io/workspace/interviews/on-going/i1',
    };
    expect(mailInvite.InterviewInvitationPayloadSchema.safeParse(payload).success).toBe(true);
  });
  it('field set produced by job-service matches the schema (static check of the source)', () => {
    const src = read('job-service/src/services/applicationService.ts');
    for (const f of Object.keys(mailInvite.InterviewInvitationPayloadSchema.shape)) {
      if (['recruiterName', 'additionalNotes'].includes(f)) continue;
      expect(src, f).toContain(f);
    }
  });
  it('NOTE: interviewLink depends on FRONTEND_URL; when unset it becomes "undefined/..." and fails z.url()', () => {
    const payload = {
      type: 'job.application.shortlisted', ...base, deadline: 'x', guideLink: 'https://g.io',
      interviewLink: `${undefined}/workspace/interviews/on-going/i1`,
    };
    expect(mailInvite.InterviewInvitationPayloadSchema.safeParse(payload).success).toBe(false);
  });

  const review = { matchPercentage: 42, fit: 'Bad Fit', strengths: ['a'], weaknesses: ['b'] };
  it('rejection payload (sendRejectionNotification) satisfies RejectionMailPayloadSchema', () => {
    const payload = {
      type: 'job.application.rejected', ...base,
      data: { stage: 'Initial Stage', review, interviewEvaluation: '' },
    };
    expect(mailReject.RejectionMailPayloadSchema.safeParse(payload).success).toBe(true);
  });
  it('NOTE: rejection with no compatibility review (findOne -> null) is rejected by the consumer schema', () => {
    const payload = {
      type: 'job.application.rejected', ...base, data: { stage: 'Initial Stage', review: null, interviewEvaluation: '' },
    };
    expect(mailReject.RejectionMailPayloadSchema.safeParse(payload).success).toBe(false);
  });
  it('MISMATCH: legacy jobService rejection payload (compatibility_review/stage at top level) does not satisfy the schema', () => {
    const legacy = {
      candidateName: 'C', candidateEmail: 'c@x.io', type: 'job.application.rejected', jobTitle: 'Dev',
      jobId: 'j', stage: 'PENDING', compatibility_review: review,
    };
    expect(mailReject.RejectionMailPayloadSchema.safeParse(legacy).success).toBe(false);
  });
  it('compatibility "fit" enum matches between job-service and notification-service', () => {
    const jobSrc = read('job-service/src/types/compatibility.types.ts');
    expect(jobSrc).toContain("z.enum(['Best Fit','Good Fit','Average','Bad Fit'])");
    expect(mailReject.RejectionMailPayloadSchema.shape.data.shape.review.shape.fit.options).toEqual(
      ['Best Fit', 'Good Fit', 'Average', 'Bad Fit']);
  });
});

describe('payload shapes: -> notifications (in-app)', () => {
  it('NEW_JOB_APPLICATION payload from applyToJob satisfies INotification', () => {
    const payload = {
      recieverEmail: 'hr@acme.io', recieverId: 'org1', type: 'new.job.application',
      title: 'New Job Application Recieved', message: 'Cand applied for the position of Dev',
    };
    expect(inappTypes.NotificationZodSchema.safeParse(payload).success).toBe(true);
    const src = read('job-service/src/services/applicationService.ts');
    for (const f of ['recieverEmail', 'recieverId', 'title', 'message']) expect(src).toContain(f);
  });
  it('INTERVIEW_SCHEDULED payload from interview_engine satisfies InterviewCreatedNotificationSchema', () => {
    const payload = {
      type: 'interview.scheduled', interviewId: 'i1', candidateId: 'c1', candidateEmail: 'c@x.io', jobId: 'j1',
      jobTitle: 'Dev', organizationId: 'o1', deadline: new Date().toISOString(), totalQuestions: 5, status: 'SCHEDULED',
    };
    expect(interviewTypes.InterviewCreatedNotificationSchema.safeParse(payload).success).toBe(true);
    const src = read('interview_engine/src/types/notification.types.ts');
    for (const k of Object.keys(interviewTypes.InterviewCreatedNotificationSchema.shape)) {
      if (k === 'organizationId') continue; // producer-only extra, stripped by consumer schema
      expect(src, k).toContain(k);
    }
  });
});
