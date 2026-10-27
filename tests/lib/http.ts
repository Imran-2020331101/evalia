/** Tiny fetch wrapper + service URL resolution for the smoke and e2e layers. */
export const DEFAULT_PORTS = {
  gateway: 8080,
  job: 7001,
  resume: 5000,
  interview: 4000,
  notification: 6001,
} as const;
export type ServiceName = keyof typeof DEFAULT_PORTS;

/** E2E_BASE_URL is a host (e.g. http://localhost); per-service overrides: E2E_JOB_URL, E2E_INTERVIEW_URL ... */
export function e2eUrl(service: ServiceName): string {
  const override = process.env[`E2E_${service.toUpperCase()}_URL`];
  if (override) return override.replace(/\/$/, '');
  const host = (process.env.E2E_BASE_URL ?? 'http://localhost').replace(/\/$/, '');
  return `${host}:${DEFAULT_PORTS[service]}`;
}

export interface Res<T = any> { status: number; body: T; }

export async function call<T = any>(method: string, url: string, body?: unknown): Promise<Res<T>> {
  const r = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let parsed: any = text;
  try { parsed = JSON.parse(text); } catch { /* plain text */ }
  return { status: r.status, body: parsed };
}

export const oid = () => [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export async function eventually<T>(fn: () => Promise<T | undefined | false>, timeoutMs = 15_000, everyMs = 500): Promise<T> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const v = await fn();
    if (v) return v as T;
    if (Date.now() > end) throw new Error('eventually: timed out');
    await new Promise((r) => setTimeout(r, everyMs));
  }
}

export function jobPayload(createdBy: string, orgId: string, orgEmail = 'hr@e2e.test') {
  return {
    createdBy,
    companyInfo: { organizationId: orgId, organizationEmail: orgEmail },
    basic: {
      title: `E2E Engineer ${Date.now()}`, jobDescription: 'E2E job', jobLocation: 'Remote', salaryFrom: 1000, salaryTo: 2000,
      deadline: '2035-01-01', jobType: 'FULL_TIME', workPlaceType: 'REMOTE', employmentLevelType: 'MID',
    },
    requirements: [{ type: 'critical', category: 'Education', description: 'BSc' }],
    responsibilities: [{ type: 'high', category: 'Dev', description: 'Build' }],
    skills: [{ type: 'moderate', category: 'Lang', description: 'TypeScript' }],
    interviewQA: [{ question: 'Tell me about yourself', referenceAnswer: 'Background' }],
  };
}
