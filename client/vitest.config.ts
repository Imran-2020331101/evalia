import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  css: { postcss: { plugins: [] } },
  resolve: { alias: { '@': path.resolve(__dirname) } },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
