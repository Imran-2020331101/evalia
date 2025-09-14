// types.ts
export type QAPair = {
  question: string;
  candidateAnswer: string;
  referenceAnswer?: string;
  importance?: number; // 1 default, >1 more important
  askedAt?: number;    // optional timestamp
  answeredAt?: number; // optional timestamp
};

export type PerQuestionEvaluation = {
  questionIndex: number;
  contentScore: number;       // 0..1
  communicationScore: number; // 0..1
  finalScore: number;         // 0..1
  similarity: number;         // raw semantic sim 0..1
  keywordsMatched: string[];
  keywordCoverage: number;    // 0..1
  responseLatency?: number;   // seconds
  fillerRate?: number;        // fraction
  notes?: string[];           // auto feedback bullets
};

export type InterviewEvaluation = {
  overallScore: number;   // 0..1
  contentAggregate: number;
  commAggregate: number;
  integrityAggregate: number;
  responsivenessAggregate: number;
  perQuestion: PerQuestionEvaluation[];
  flags: string[];        // e.g., ['multiple_faces', 'absent_10s']
  decision?: 'advance' | 'maybe' | 'reject';
};
