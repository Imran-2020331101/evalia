import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    clearMocks: true,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/**/*.d.ts'],
      reporter: ['text', 'text-summary', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
});
