import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['contract/**/*.test.ts', 'smoke/**/*.test.ts', 'e2e/**/*.spec.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    reporters: 'default',
  },
});
