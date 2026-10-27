import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('joins class names', () => expect(cn('a', 'b')).toBe('a b'))
  it('drops falsy values', () => expect(cn('a', false, null, undefined, 'b')).toBe('a b'))
  it('supports conditional objects and arrays', () => expect(cn(['a', { b: true, c: false }])).toBe('a b'))
  it('resolves tailwind conflicts, last wins', () => expect(cn('p-2', 'p-4')).toBe('p-4'))
})
