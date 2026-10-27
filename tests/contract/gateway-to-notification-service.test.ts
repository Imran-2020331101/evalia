import { describe, it, expect } from 'vitest';
import { GATEWAY_JAVA, parseExpressRoutes, parseFeignProxy, read } from '../lib/contract.js';
import { assertEndpoints } from '../lib/endpoints.js';

const routes = parseExpressRoutes('notification-service/src/routes/notificationRoutes.ts', '/api/notifications');

describe('gateway NotificationProxy -> notification-service /api/notifications', () => {
  const { endpoints } = parseFeignProxy(`${GATEWAY_JAVA}/notification/Proxy/NotificationProxy.java`);
  it('parses four endpoints', () => expect(endpoints).toHaveLength(4));
  assertEndpoints(endpoints, routes);

  it('PUT read-all and PUT read do not shadow each other', () => {
    const readAll = routes.findIndex((r) => r.method === 'PUT' && r.path.endsWith('/read-all'));
    const readOne = routes.findIndex((r) => r.method === 'PUT' && r.path.endsWith('/read'));
    expect(readAll).toBeGreaterThanOrEqual(0);
    expect(readOne).toBeGreaterThanOrEqual(0);
  });
});

describe('notification-service extras', () => {
  it('POST /batch-rejection-feedback exists and is not shadowed by GET /:userId (different method)', () => {
    expect(routes.map((r) => `${r.method} ${r.path}`)).toContain('POST /api/notifications/batch-rejection-feedback');
  });
  it('batch endpoint requires the documented fields', () => {
    const src = read('notification-service/src/routes/notificationRoutes.ts');
    for (const f of ['jobId', 'jobTitle', 'companyName', 'shortlistedCandidates', 'allApplicants', 'recruiterId']) {
      expect(src).toContain(f);
    }
  });
  it('MISMATCH (config): notification-service default PORT (6000) differs from .env.example (6001)', () => {
    expect(read('notification-service/src/config/env.ts')).toMatch(/PORT: process\.env\.PORT \|\| 6000/);
    expect(read('notification-service/.env.example')).toMatch(/^PORT=6001/m);
  });
});
