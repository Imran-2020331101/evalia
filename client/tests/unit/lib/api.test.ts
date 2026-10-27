import { describe, expect, it } from 'vitest'

// lib/api.ts is currently an empty module; importing it must not throw.
describe('lib/api', () => {
  it('is importable', async () => {
    // Variable specifier: tsc rejects a static import of a file with no exports.
    const path = '@/lib/api'
    const mod = await import(/* @vite-ignore */ path)
    expect(mod).toBeDefined()
  })
})
