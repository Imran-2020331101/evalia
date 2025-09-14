
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

export type IInterviewEvaluation = {
  overallScore: number;   // 0..1
  contentAggregate: number;
  commAggregate: number;
  integrityAggregate: number;
  responsivenessAggregate: number;
  perQuestion: PerQuestionEvaluation[];
  flags: string[];        // e.g., ['multiple_faces', 'absent_10s']
  decision?: 'advance' | 'maybe' | 'reject';
};


export type TranscriptMessage = {
  role: "assistant" | "user";
  text: string;
};

