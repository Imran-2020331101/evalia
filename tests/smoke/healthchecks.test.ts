import { describe, it, expect } from 'vitest';

/**
 * Skipped unless SMOKE_BASE_URLS is set. Format (comma separated name=url):
 *   SMOKE_BASE_URLS="gateway=http://localhost:8080,job=http://localhost:7001,resume=http://localhost:5000,interview=http://localhost:4000,notification=http://localhost:6001"
 * Only the services listed are checked. Health endpoints come from each service's app/routes:
 *   gateway       GET /                       any response < 500 (Spring Boot, no actuator configured in repo)
 *   job           GET /                       200 + {success:true}  (job-service has no /health route)
 *   resume        GET /health  and /api/health  200 + {success:true}   (docs/ports-and-endpoints.md says port 5001; code/.env say 5000)
 *   interview     GET /health                 200 "ok"
 *   notification  GET /api/notifications/smoke-probe  200 (no dedicated health route; needs Mongo)
 */
const raw = process.env.SMOKE_BASE_URLS;
const targets: Record<string, string> = {};
for (const pair of (raw ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
  const i = pair.indexOf('=');
  if (i > 0) targets[pair.slice(0, i)] = pair.slice(i + 1).replace(/\/$/, '');
}

const checks: Record<string, { path: string; ok: (status: number, body: string) => boolean }[]> = {
  gateway: [{ path: '/', ok: (s) => s < 500 }],
  job: [{ path: '/', ok: (s, b) => s === 200 && b.includes('"success":true') }],
  resume: [
    { path: '/health', ok: (s, b) => s === 200 && b.includes('"success":true') },
    { path: '/api/health', ok: (s, b) => s === 200 && b.includes('"success":true') },
  ],
  interview: [{ path: '/health', ok: (s, b) => s === 200 && b.trim() === 'ok' }],
  notification: [{ path: '/api/notifications/smoke-probe', ok: (s) => s === 200 }],
};

describe.skipIf(!raw)('service health endpoints', () => {
  for (const [name, list] of Object.entries(checks)) {
    for (const c of list) {
      it.skipIf(!targets[name])(`${name} ${c.path}`, async () => {
        const r = await fetch(targets[name] + c.path, { signal: AbortSignal.timeout(5000) });
        const body = await r.text();
        expect(c.ok(r.status, body), `${name} ${c.path} -> ${r.status} ${body.slice(0, 120)}`).toBe(true);
      });
    }
  }
});
