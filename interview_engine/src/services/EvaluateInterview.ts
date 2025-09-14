// evaluateInterview.ts

import { InterviewEvaluation, PerQuestionEvaluation, QAPair } from "../types/evaluation.types";

// NOTE: replace semanticSimilarity with your embeddings-based implementation
async function semanticSimilarity(a: string, b: string): Promise<number> {
  // placeholder: return in 0..1
  // implement via embeddings + cosine similarity
  return 0.7; // stub
}

function countKeywords(answer: string, keywords: string[]): { matched: string[]; coverage: number } {
  const text = answer.toLowerCase();
  const matched = keywords.filter(kw => text.includes(kw.toLowerCase()));
  const coverage = keywords.length ? matched.length / keywords.length : 0;
  return { matched, coverage };
}

function countFillerWords(answer: string) {
  const fillerList = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'i mean'];
  const words = answer.toLowerCase().split(/\s+/).filter(Boolean);
  let fillers = 0;
  for (const f of fillerList) {
    // count occurrences
    const re = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const m = answer.toLowerCase().match(re);
    if (m) fillers += m.length;
  }
  return { fillers, totalWords: words.length, fillerRate: words.length ? fillers / words.length : 0 };
}

export async function evaluateInterview(
  qaPairs: QAPair[],
  integrityAggregate: number, // 0..1 from interviewService.finalizeIntegrity
  config?: {
    questionKeywords?: Record<number, string[]>; // optional mapping
    maxLatencySeconds?: number;
    maxPauseSeconds?: number;
    weights?: { content?: number; comm?: number; integrity?: number; resp?: number; }
  }
): Promise<InterviewEvaluation> {
  const defaults = {
    maxLatencySeconds: 8,
    maxPauseSeconds: 4,
    weights: { content: 0.6, comm: 0.15, integrity: 0.15, resp: 0.1 }
  };
  const cfg = { ...defaults, ...(config || {}) };

  const perQuestion: PerQuestionEvaluation[] = [];

  let sumContent = 0, sumComm = 0, totalImportance = 0, sumResp = 0;

  for (let i = 0; i < qaPairs.length; i++) {
    const q = qaPairs[i];
    const importance = (q.importance || 1);
    totalImportance += importance;

    // content components
    const sim = q.referenceAnswer ? await semanticSimilarity(q.candidateAnswer, q.referenceAnswer) : 0.5;
    // keywords (if provided)
    const keywords = (config?.questionKeywords && config.questionKeywords[i]) || [];
    const { matched, coverage } = countKeywords(q.candidateAnswer, keywords);

    const candidateWords = q.candidateAnswer ? q.candidateAnswer.split(/\s+/).length : 0;
    const refWords = q.referenceAnswer ? q.referenceAnswer.split(/\s+/).length : Math.max(1, candidateWords);
    const lenRatio = Math.min(1, candidateWords / Math.max(1, refWords));

    const contentScore = 0.6 * sim + 0.3 * coverage + 0.1 * lenRatio;

    // communication components
    const { fillers, totalWords, fillerRate } = countFillerWords(q.candidateAnswer || '');
    // latency (if timestamps provided)
    let latencyScore = 1;
    if (q.askedAt && q.answeredAt) {
      const latency = Math.max(0, (q.answeredAt - q.askedAt) / 1000); // sec
      latencyScore = 1 - Math.min(1, latency / cfg.maxLatencySeconds);
    }

    // pause penalty naive (if we had timestamps of word level we'd compute long pauses)
    const pausePenalty = 1; // placeholder

    const commScore = 0.5 * (1 - Math.min(1, fillerRate / 0.05)) + 0.3 * pausePenalty + 0.2 * latencyScore;

    const qFinal = 0.75 * contentScore + 0.25 * commScore;

    sumContent += contentScore * importance;
    sumComm += commScore * importance;
    // responsiveness AVG uses latencyScore
    sumResp += latencyScore * importance;

    perQuestion.push({
      questionIndex: i,
      contentScore: Number(contentScore.toFixed(3)),
      communicationScore: Number(commScore.toFixed(3)),
      finalScore: Number(qFinal.toFixed(3)),
      similarity: Number(sim.toFixed(3)),
      keywordsMatched: matched,
      keywordCoverage: Number(coverage.toFixed(3)),
      responseLatency: q.askedAt && q.answeredAt ? (q.answeredAt - q.askedAt) / 1000 : undefined,
      fillerRate: Number(fillerRate.toFixed(3)),
      notes: [] // generate simple feedback later
    });
  }

  const contentAggregate = sumContent / Math.max(1e-9, totalImportance);
  const commAggregate = sumComm / Math.max(1e-9, totalImportance);
  const respAggregate = sumResp / Math.max(1e-9, totalImportance);

  const w = cfg.weights!;
  const overall =
    (w.content ?? 0.6) * contentAggregate +
    (w.comm ?? 0.15) * commAggregate +
    (w.integrity ?? 0.15) * integrityAggregate +
    (w.resp ?? 0.1) * respAggregate;

  // Decide decision rule:
  let decision: InterviewEvaluation['decision'] = 'maybe';
  const overallPct = overall * 100;
  if (integrityAggregate < 0.3) decision = 'reject';
  else if (overallPct >= 75 && integrityAggregate >= 0.6) decision = 'advance';
  else if (overallPct >= 60) decision = 'maybe';
  else decision = 'reject';

  const flags: string[] = [];
  if (integrityAggregate < 0.5) flags.push('low_integrity');
  // other flags (e.g., missing keywords) can be added here

  return {
    overallScore: Number(overall.toFixed(3)),
    contentAggregate: Number(contentAggregate.toFixed(3)),
    commAggregate: Number(commAggregate.toFixed(3)),
    integrityAggregate: Number(integrityAggregate.toFixed(3)),
    responsivenessAggregate: Number(respAggregate.toFixed(3)),
    perQuestion,
    flags,
    decision
  };
}
