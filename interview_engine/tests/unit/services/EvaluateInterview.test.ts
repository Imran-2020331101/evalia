import { describe, it, expect, vi } from 'vitest';

const sim = vi.hoisted(() => vi.fn());
vi.mock('../../../src/config/ApiNinja', () => ({ similarityAPINinjas: sim }));

import { evaluateInterview } from '../../../src/services/EvaluateInterview';

const qa = (candidateAnswer: string | null, referenceAnswer?: string) => ({
  question: 'Q', candidateAnswer, referenceAnswer,
});

describe('evaluateInterview', () => {
  it('uses neutral similarity 0.5 when there is no reference answer (no API call)', async () => {
    const r = await evaluateInterview([qa('one two three')], 1);
    expect(sim).not.toHaveBeenCalled();
    expect(r.perQuestion[0].similarity).toBe(0.5);
    // lenRatio: refWords = max(1, 3) -> 1 ; content = .6*.5 + 0 + .1*1 = .4
    expect(r.perQuestion[0].contentScore).toBe(0.4);
  });

  it('calls the similarity API with candidate and reference answers', async () => {
    sim.mockResolvedValue(1);
    await evaluateInterview([qa('same words here', 'same words here')], 1);
    expect(sim).toHaveBeenCalledWith('same words here', 'same words here');
  });

  it('sends a single space for a missing candidate answer', async () => {
    sim.mockResolvedValue(0);
    const r = await evaluateInterview([qa(null, 'ref answer')], 1);
    expect(sim).toHaveBeenCalledWith(' ', 'ref answer');
    expect(r.perQuestion[0].contentScore).toBe(0);
    expect(r.perQuestion[0].fillerRate).toBe(0);
  });

  it('computes scores for a perfect answer', async () => {
    sim.mockResolvedValue(1);
    const r = await evaluateInterview([qa('a b c', 'a b c')], 1);
    const p = r.perQuestion[0];
    expect(p.contentScore).toBe(0.7);       // .6 + 0 + .1
    expect(p.communicationScore).toBe(1);
    expect(p.finalScore).toBe(0.775);       // .75*.7 + .25*1
    expect(p.responseLatency).toBe(0);
    expect(p.notes).toEqual([]);
    expect(r.overallScore).toBe(0.82);      // .42 + .15 + .15 + .1
    expect(r.decision).toBe('advance');
    expect(r.flags).toEqual([]);
    expect(r.contentAggregate).toBe(0.7);
    expect(r.commAggregate).toBe(1);
    expect(r.responsivenessAggregate).toBe(1);
    expect(r.integrityAggregate).toBe(1);
  });

  it('caps the length ratio at 1 and scales for short answers', async () => {
    sim.mockResolvedValue(0);
    const short = await evaluateInterview([qa('one two', 'a b c d')], 1); // 2/4
    expect(short.perQuestion[0].contentScore).toBe(0.05);
    const long = await evaluateInterview([qa('a b c d e f', 'a b')], 1);
    expect(long.perQuestion[0].contentScore).toBe(0.1);
  });

  it('matches keywords case-insensitively using config.questionKeywords by index', async () => {
    sim.mockResolvedValue(0);
    const r = await evaluateInterview(
      [qa('We use REST and Caching', 'x'), qa('nothing relevant', 'x')],
      1,
      { questionKeywords: { 0: ['rest', 'caching', 'graphql', 'CACHING'] } }
    );
    expect(r.perQuestion[0].keywordsMatched).toEqual(['rest', 'caching', 'CACHING']);
    expect(r.perQuestion[0].keywordCoverage).toBe(0.75);
    expect(r.perQuestion[1].keywordsMatched).toEqual([]);
    expect(r.perQuestion[1].keywordCoverage).toBe(0);
  });

  it('treats an empty keyword list as zero coverage', async () => {
    sim.mockResolvedValue(0);
    const r = await evaluateInterview([qa('abc', 'x')], 1, { questionKeywords: { 0: [] } });
    expect(r.perQuestion[0].keywordCoverage).toBe(0);
  });

  it('counts filler words and lowers the communication score', async () => {
    sim.mockResolvedValue(1);
    // words: um uh like you know so actually basically i mean = 1+1+1+2+1+1+1+2 = 10 words, fillers: 8 matched tokens
    const r = await evaluateInterview([qa('um uh like you know so actually basically i mean', 'ref')], 1);
    const p = r.perQuestion[0];
    expect(p.fillerRate).toBe(0.8);
    expect(p.communicationScore).toBe(0.5); // .5*(1-1) + .3 + .2
  });

  it('filler rate below 5% is partially penalised', async () => {
    sim.mockResolvedValue(1);
    const words = Array(39).fill('word').concat('um').join(' '); // 1/40 = .025
    const r = await evaluateInterview([qa(words, 'ref')], 1);
    expect(r.perQuestion[0].fillerRate).toBe(0.025);
    expect(r.perQuestion[0].communicationScore).toBe(0.75);
  });

  it('only counts fillers on word boundaries', async () => {
    sim.mockResolvedValue(1);
    const r = await evaluateInterview([qa('summer sofa likely umbrella', 'ref')], 1);
    expect(r.perQuestion[0].fillerRate).toBe(0);
  });

  describe('decision rules', () => {
    it('rejects outright when integrity < 0.3, even with a perfect interview', async () => {
      sim.mockResolvedValue(1);
      const r = await evaluateInterview([qa('a b', 'a b')], 0.29);
      expect(r.decision).toBe('reject');
      expect(r.flags).toEqual(['low_integrity']);
    });

    it('advance needs overall >= 75% AND integrity >= 0.6', async () => {
      sim.mockResolvedValue(1);
      expect((await evaluateInterview([qa('a b', 'a b')], 0.6)).decision).toBe('advance');
      // integrity .55: overall = .67 + .0825 = .7525 -> >=75 but integrity<.6 -> falls to maybe
      const r = await evaluateInterview([qa('a b', 'a b')], 0.55);
      expect(r.overallScore).toBeGreaterThanOrEqual(0.75);
      expect(r.decision).toBe('maybe');
      expect(r.flags).toEqual([]);
    });

    it('is "maybe" between 60 and 75', async () => {
      sim.mockResolvedValue(1);
      const r = await evaluateInterview([qa('a b', 'a b')], 0.4); // .67+.06 = .73
      expect(r.decision).toBe('maybe');
      expect(r.flags).toEqual(['low_integrity']);
    });

    it('rejects below 60', async () => {
      sim.mockResolvedValue(0);
      const r = await evaluateInterview([qa('a b', 'x y z w')], 0.5);
      expect(r.overallScore).toBeLessThan(0.6);
      expect(r.decision).toBe('reject');
    });
  });

  it('handles an empty interview without NaN', async () => {
    const r = await evaluateInterview([], 1);
    expect(r.perQuestion).toEqual([]);
    expect(r.contentAggregate).toBe(0);
    expect(r.commAggregate).toBe(0);
    expect(r.overallScore).toBe(0.15); // only integrity contributes
    expect(r.decision).toBe('reject');
  });

  it('averages across questions', async () => {
    sim.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    const r = await evaluateInterview([qa('a', 'a'), qa('b', 'zzz zzz zzz')], 1);
    expect(r.perQuestion.map((p) => p.questionIndex)).toEqual([0, 1]);
    expect(r.contentAggregate).toBe(0.367); // (.7 + .033)/2
  });

  it('honours custom weights (missing keys fall back to defaults)', async () => {
    sim.mockResolvedValue(1);
    const r = await evaluateInterview([qa('a b', 'a b')], 1, { weights: { content: 1, comm: 0, integrity: 0, resp: 0 } });
    expect(r.overallScore).toBe(0.7);
    const partial = await evaluateInterview([qa('a b', 'a b')], 1, { weights: { content: 0 } });
    // content 0, comm .15, integrity .15, resp .1
    expect(partial.overallScore).toBe(0.4);
  });

  it('falls back to default content weight when only other weights are given', async () => {
    sim.mockResolvedValue(1);
    const r = await evaluateInterview([qa('a b', 'a b')], 1, { weights: { comm: 0, integrity: 0, resp: 0 } });
    expect(r.overallScore).toBe(0.42); // 0.6 default * 0.7
  });

  it('propagates similarity API failures', async () => {
    sim.mockRejectedValue(new Error('ninja down'));
    await expect(evaluateInterview([qa('a', 'b')], 1)).rejects.toThrow('ninja down');
  });
});
