import { describe, it, expect, beforeEach } from 'vitest';
import { IntergrityService, intergrityService } from '../../../src/services/IntegrityService';

const good = { faceCount: 1, eyeContact: 1, speaking: 1, blinkRate: 0.08 };
const T0 = 1_000_000;

/** Feeds n updates, 1s apart, starting at T0. Returns the last response. */
function feed(svc: IntergrityService, id: string, n: number, m: any) {
  let r: any;
  for (let i = 0; i < n; i++) r = svc.updateIntegrity(id, m, T0 + i * 1000);
  return r;
}

describe('IntergrityService', () => {
  let svc: IntergrityService;
  beforeEach(() => { svc = new IntergrityService(); });

  it('exports a singleton', () => {
    expect(intergrityService).toBeInstanceOf(IntergrityService);
  });

  describe('instant score', () => {
    it('is 1 for a perfect sample', () => {
      expect(svc.updateIntegrity('a', good, T0).instantScore).toBeCloseTo(1, 10);
    });

    it('uses Date.now() when no timestamp is supplied', () => {
      const r = svc.updateIntegrity('a', good);
      expect(r.interviewId).toBe('a');
      expect(r.instantScore).toBeCloseTo(1);
    });

    it('face count 0 contributes 0 (weight 2/5)', () => {
      expect(svc.updateIntegrity('a', { ...good, faceCount: 0 }, T0).instantScore).toBeCloseTo(0.6, 10);
    });

    it('multiple faces contribute 1/faceCount', () => {
      // (2*0.5 + 1 + 1 + 1)/5 = 0.8
      expect(svc.updateIntegrity('a', { ...good, faceCount: 2 }, T0).instantScore).toBeCloseTo(0.8, 10);
    });

    it('clamps eye contact and speaking into [0,1]', () => {
      const hi = svc.updateIntegrity('hi', { ...good, eyeContact: 5, speaking: 9 }, T0).instantScore;
      expect(hi).toBeCloseTo(1, 10);
      // eye=-3 -> 0, speak=-1 -> 0 : (2+0+0+1)/5 = 0.6
      const lo = svc.updateIntegrity('lo', { ...good, eyeContact: -3, speaking: -1 }, T0).instantScore;
      expect(lo).toBeCloseTo(0.6, 10);
    });

    it('penalises blink rates away from 0.08/s, bottoming out at 0', () => {
      // blink 0.04 -> 0.5 : (2+1+1+0.5)/5 = 0.9
      expect(svc.updateIntegrity('a', { ...good, blinkRate: 0.04 }, T0).instantScore).toBeCloseTo(0.9, 10);
      // blink 0 or 0.16+ -> 0 : 0.8
      expect(svc.updateIntegrity('b', { ...good, blinkRate: 0 }, T0).instantScore).toBeCloseTo(0.8, 10);
      expect(svc.updateIntegrity('c', { ...good, blinkRate: 10 }, T0).instantScore).toBeCloseTo(0.8, 10);
    });
  });

  describe('state accumulation', () => {
    it('keeps independent state per interview', () => {
      feed(svc, 'a', 3, { ...good, faceCount: 0 });
      const b = svc.updateIntegrity('b', good, T0);
      expect(b.violations.absent).toBe(false);
      expect(b.aggregateScore).toBeCloseTo(1, 10);
    });

    it('rounds sampleCount from time-weighted dt (≈ number of 1s updates)', () => {
      const r = feed(svc, 's', 5, good);
      expect(r.sampleCount).toBe(4); // first sample has dt=0.001, others 1s each
    });

    it('smoothed score starts at the first sample and moves with EWMA alpha 0.18', () => {
      const first = svc.updateIntegrity('e', good, T0).smoothedScore;
      expect(first).toBeCloseTo(1, 10);
      const second = svc.updateIntegrity('e', { ...good, faceCount: 0, eyeContact: 0, speaking: 0 }, T0 + 1000);
      // face: .82*1, gaze: .82, speak: .82, blink: 0.18*0.. blinkScore still 1 -> 1
      const expected = (2 * 0.82 + 0.82 + 0.82 + 1) / 5;
      expect(second.smoothedScore).toBeCloseTo(expected, 10);
    });

    it('re-seeds an EWMA that has dropped to exactly 0 (quirk of the 0 sentinel)', () => {
      // a first sample of 0 leaves ewma at 0, so the second sample is taken as-is rather than smoothed
      svc.updateIntegrity('z', { ...good, faceCount: 0 }, T0);
      const r = svc.updateIntegrity('z', good, T0 + 1000);
      expect(r.smoothedScore).toBeCloseTo(1, 10);
    });
  });

  describe('violations and penalties', () => {
    it('flags sustained absence (>=3s) and zeroes aggregate once >5s', () => {
      const four = feed(svc, 'abs', 5, { ...good, faceCount: 0 });
      expect(four.violations.absent).toBe(true);
      expect(four.aggregateScore).toBeGreaterThan(0); // absentSeconds ~4 -> not yet >5

      const seven = feed(new IntergrityService(), 'abs', 8, { ...good, faceCount: 0 });
      expect(seven.violations.absent).toBe(true);
      expect(seven.aggregateScore).toBe(0);
    });

    it('does not flag short absence', () => {
      const r = feed(svc, 'abs', 2, { ...good, faceCount: 0 });
      expect(r.violations.absent).toBe(false);
    });

    it('flags sustained multiple faces and decays the aggregate exponentially per minute', () => {
      const r = feed(svc, 'mf', 5, { ...good, faceCount: 2 });
      expect(r.violations.multipleFaces).toBe(true);
      // face avg 0.5 => agg = (2*.5+1+1+1)/5 = .8 ; penalty .5^(4.001/60)
      expect(r.aggregateScore).toBeCloseTo(0.8 * Math.pow(0.5, 4.001 / 60), 3);
    });

    it('does not flag a single brief multi-face sample as a violation but still applies a tiny penalty', () => {
      const r = feed(svc, 'mf', 2, { ...good, faceCount: 3 });
      expect(r.violations.multipleFaces).toBe(false);
      expect(r.aggregateScore).toBeLessThan((2 / 3 * 2 + 3) / 5);
    });

    it('flags low eye contact after 10s and scales aggregate by 0.6', () => {
      const m = { ...good, eyeContact: 0.1 };
      const short = feed(svc, 'lg', 10, m); // 9.001s of low gaze
      expect(short.violations.lowEyeContact).toBe(false);

      const long = feed(new IntergrityService(), 'lg', 12, m);
      expect(long.violations.lowEyeContact).toBe(true);
      // gaze avg .1 => (2+.1+1+1)/5 = .82 ; * .6
      expect(long.aggregateScore).toBeCloseTo(0.82 * 0.6, 2);
    });

    it('treats eye contact of exactly 0.4 as not low', () => {
      const r = feed(svc, 'g', 15, { ...good, eyeContact: 0.4 });
      expect(r.violations.lowEyeContact).toBe(false);
    });

    it('clamps all returned scores to [0,1]', () => {
      const r = feed(svc, 'c', 3, { faceCount: 0, eyeContact: -1, speaking: -1, blinkRate: -5 });
      for (const v of [r.instantScore, r.aggregateScore, r.smoothedScore]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('finalizeIntegrity', () => {
    it('returns a conservative default of 1 with no data', () => {
      expect(svc.finalizeIntegrity('none')).toEqual({ finalScore: 1, details: null });
    });

    it('returns the averaged score and clears state', () => {
      feed(svc, 'f', 4, good);
      const { finalScore, details } = svc.finalizeIntegrity('f');
      expect(finalScore).toBeCloseTo(1, 10);
      expect(details).not.toBeNull();
      expect(details!.startedAt).toBe(T0);
      expect(svc.finalizeIntegrity('f')).toEqual({ finalScore: 1, details: null });
    });

    it('returns 0 after sustained absence (>5s)', () => {
      feed(svc, 'f', 8, { ...good, faceCount: 0 });
      expect(svc.finalizeIntegrity('f').finalScore).toBe(0);
    });

    it('applies multiple-face decay and low-gaze factor', () => {
      feed(svc, 'f', 13, { faceCount: 2, eyeContact: 0, speaking: 1, blinkRate: 0.08 });
      const { finalScore, details } = svc.finalizeIntegrity('f');
      expect(details!.violatedLowEyeContact).toBe(true);
      const avg = (2 * 0.5 + 0 + 1 + 1) / 5; // 0.6
      const expected = avg * Math.pow(0.5, details!.multipleFaceSeconds / 60) * 0.6;
      expect(finalScore).toBeCloseTo(expected, 6);
    });

    it('finalScore without penalties equals the weighted average', () => {
      feed(svc, 'f', 3, { faceCount: 1, eyeContact: 0.5, speaking: 0.5, blinkRate: 0.08 });
      // (2*1 + .5 + .5 + 1)/5 = .8
      expect(svc.finalizeIntegrity('f').finalScore).toBeCloseTo(0.8, 10);
    });
  });
});
