import { vi } from 'vitest'

const tween = () => ({ kill: vi.fn(), pause: vi.fn(), play: vi.fn(), then: undefined })
const timeline: any = () => {
  const t: any = {}
  for (const k of ['fromTo', 'from', 'to', 'set', 'add', 'call', 'play', 'pause', 'kill']) t[k] = vi.fn(() => t)
  return t
}
const gsap = {
  registerPlugin: vi.fn(),
  timeline: vi.fn(timeline),
  to: vi.fn(tween),
  from: vi.fn(tween),
  fromTo: vi.fn(tween),
  set: vi.fn(),
  killTweensOf: vi.fn(),
  context: vi.fn(() => ({ revert: vi.fn(), add: vi.fn() })),
  utils: { toArray: vi.fn(() => []) },
}
export default gsap
export { gsap }
export const ScrollTrigger = { create: vi.fn(), refresh: vi.fn(), kill: vi.fn(), getAll: vi.fn(() => []) }
export class SplitText {
  words: Element[] = []
  lines: Element[] = []
  chars: Element[] = []
  revert() {}
}
export const useGSAP = (cb?: any) => {
  // run the animation callback once like the real hook would on mount
  const React = require('react')
  React.useEffect(() => {
    try {
      cb?.()
    } catch {}
  }, [])
}
export const Draggable = { create: vi.fn(() => [{ kill: vi.fn() }]) }
export const InertiaPlugin = {}
