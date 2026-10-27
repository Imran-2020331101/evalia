# Evalia root tests

Cross-service tests that live outside any single service. Self-contained: `npm install` here only.

```bash
cd tests && npm install
npm test                # contract layer runs; smoke + e2e are skipped without env vars
```

## Layers

| Layer | Dir | Needs running services? | How it runs |
|---|---|---|---|
| Contract | `contract/*.test.ts` | No | Parses the gateway's Feign proxies (`server/auth-gateway/.../Proxy/*.java`) and DTOs, parses each Express router file, and checks every gateway call resolves to a downstream route (Express first-match semantics). Zod schemas are imported straight from service source and fed gateway-shaped payloads. Job/interview -> notification RabbitMQ queue names, event enums and payload schemas are checked the same way. |
| Smoke | `smoke/healthchecks.test.ts` | Yes | Skipped unless `SMOKE_BASE_URLS` is set. |
| E2E | `e2e/*.spec.ts` | Yes | Skipped unless `E2E_BASE_URL` is set. |

Known gateway/service drift is encoded as `KNOWN MISMATCH` / `MISMATCH` tests that assert the drift still exists; when you fix one, the test fails and you delete the entry (`knownMismatches` in each contract file).

## Smoke

```bash
SMOKE_BASE_URLS="gateway=http://localhost:8080,job=http://localhost:7001,resume=http://localhost:5000,interview=http://localhost:4000,notification=http://localhost:6001" npm run test:smoke
```
Only listed services are checked. Default ports come from each service's code / `.env.example` (note `docs/ports-and-endpoints.md` is outdated: it says resume=5001).

## E2E

1. Start infra: `npm run stack:up` (mongo, rabbitmq, redis, qdrant from `docker-compose.test.yml`).
2. Start services from source on the host (they hard-code `amqp://localhost:5672` / `redis://localhost:6379`), each with its own `.env` (copy `.env.example`):
   - `job-service` (`PORT=7001`, `INTERVIEW_SERVICE_URL=http://localhost:4000`, `RESUME_SERVICE_URL=http://localhost:5000`, `FRONTEND_URL=http://localhost:3000`, `MONGODB_URI`, `QDRANT_HOST=http://localhost:6333`)
   - `interview_engine` (`PORT=4000`, `MONGODB_URI`)
   - `notification-service` (`PORT=6001`, `MONGO_URI`)
   - optionally `resume-service` (`PORT=5000`) and the Spring gateway (8080)
3. `E2E_BASE_URL=http://localhost npm run test:e2e`
   Overrides: `E2E_JOB_URL`, `E2E_INTERVIEW_URL`, `E2E_NOTIFICATION_URL`, `E2E_RESUME_URL`, `E2E_GATEWAY_URL`.
4. `npm run stack:down`

The e2e specs call the Node services directly (the gateway needs JWT/OTP login not seeded in the test stack). Flows: `candidateApplyFlow`, `recruiterHiringFlow`, `interviewFlow`. LLM/SMTP-dependent steps are routed-only or not asserted. These specs have not been run against a live stack in CI.

## Other test layers in the repo

- Client: `cd client && npm test` (Vitest, `client/tests`), `npm run typecheck`
- job-service / resume-service / interview_engine / notification-service: `cd <service> && npx vitest run` (each has a `vitest.config.ts` and `tests/`)
- Auth gateway: `cd server/auth-gateway && ./mvnw test` (includes `*ProxyContractTest` under `src/test`)
