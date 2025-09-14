import mongoose, { Schema, Document } from 'mongoose';

// Per-question evaluation interface
interface IQuestionEvaluation {
  questionIndex: number;
  contentScore: number;
  communicationScore: number;
  finalScore: number;
  similarity: number;
  keywordsMatched: string[];
  keywordCoverage: number;
  responseLatency: number;
  fillerRate: number;
}

// Main evaluation interface
export interface IInterviewEvaluation extends Document {
  interviewId: mongoose.Types.ObjectId;
  overallScore: number;
  contentAggregate: number;
  commAggregate: number;
  integrityAggregate: number;
  responsivenessAggregate: number;
  perQuestion: IQuestionEvaluation[];
  flags: string[];
  decision: string;
}

// Per-question schema
const QuestionEvaluationSchema = new Schema({
  questionIndex: { type: Number, required: true },
  contentScore: { type: Number, required: true },
  communicationScore: { type: Number, required: true },
  finalScore: { type: Number, required: true },
  similarity: { type: Number, required: true },
  keywordsMatched: [{ type: String }],
  keywordCoverage: { type: Number, required: true },
  responseLatency: { type: Number, required: true },
  fillerRate: { type: Number, required: true }
}, { _id: false });

// Main evaluation schema
const InterviewEvaluationSchema = new Schema({
  interviewId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'InterviewTranscript',
    required: true 
  },
  overallScore: { type: Number, required: true },
  contentAggregate: { type: Number, required: true },
  commAggregate: { type: Number, required: true },
  integrityAggregate: { type: Number, required: true },
  responsivenessAggregate: { type: Number, required: true },
  perQuestion: [QuestionEvaluationSchema],
  flags: [{ type: String }],
  decision: { 
    type: String, 
    enum: ['advance', 'reject', 'review', 'pending'],
    required: true 
  }
}, { timestamps: true });

export const InterviewEvaluation = mongoose.model<IInterviewEvaluation>('InterviewEvaluation', InterviewEvaluationSchema);
