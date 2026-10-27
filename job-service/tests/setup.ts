import { vi } from 'vitest';

// Deterministic, offline environment for every test file.
process.env.NODE_ENV = 'test';
process.env.RESUME_SERVICE_URL = 'http://resume.test';
process.env.INTERVIEW_SERVICE_URL = 'http://interview.test';
process.env.FRONTEND_URL = 'http://frontend.test';
process.env.QDRANT_JOB_COLLECTION_NAME = 'jobs-test';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.OPEN_ROUTER_API_KEY = 'test-openrouter-key';
process.env.QDRANT_HOST = 'http://qdrant.test';
process.env.QDRANT_API_KEY = 'test-qdrant-key';

// Keep test output quiet; individual tests may re-spy to assert on calls.
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
