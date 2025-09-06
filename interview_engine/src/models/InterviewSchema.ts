import mongoose, { Schema, Model } from 'mongoose';
import { 
  IQuestionAnswer, 
  IInterviewTranscript, 
  IInterviewTranscriptStatics 
} from '../types/interview';

// Individual question-answer pair schema
const QuestionAnswerSchema = new Schema<IQuestionAnswer>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    candidateAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    referenceAnswer: {
      type: String,
      required: false,
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Main interview transcript schema
const InterviewTranscriptSchema = new Schema<IInterviewTranscript>(
  {
    // Candidate information
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    candidateEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },

    // Job information
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    // Interview details
    interviewType: {
      type: String,
      enum: ["TECHNICAL", "BEHAVIORAL", "MIXED", "SCREENING"],
      default: "TECHNICAL",
    },

    interviewStatus: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "SCHEDULED",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    totalDuration: {
      type: Number, // in seconds
      default: 0,
    },

    // Questions and answers
    questionsAnswers: {
      type: [QuestionAnswerSchema],
      default: [],
    },

    // Overall assessment
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    overallFeedback: {
      type: String,
      trim: true,
      default: null,
    },
    recommendation: {
      type: String,
      enum: ["STRONG_HIRE", "HIRE", "NO_HIRE", "STRONG_NO_HIRE", "PENDING"],
      default: "PENDING",
    },

    // Technical metadata
    recordingUrl: {
      type: String,
      trim: true,
      default: null,
    },
    transcriptMetadata: {
      language: {
        type: String,
        default: "en-US",
      },
      integrity: {
        type: Number,
        min: 0,
        max: 1,
      },
      processingTime: {
        type: Number, // in milliseconds
      },
    },

    // Audit fields
    createdBy: {
      type: String,
      default: "SYSTEM",
    },
    updatedBy: {
      type: String,
      default: "SYSTEM",
    },

    // Additional notes
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
InterviewTranscriptSchema.index({ candidateEmail: 1, jobId: 1 });
InterviewTranscriptSchema.index({ interviewStatus: 1, scheduledAt: -1 });
InterviewTranscriptSchema.index({ createdAt: -1 });

// Virtual for calculated interview duration
InterviewTranscriptSchema.virtual("calculatedDuration").get(function(this: IInterviewTranscript) {
  if (this.startedAt && this.completedAt) {
    return Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000); // in seconds
  }
  return 0;
});

// Virtual for total questions count
InterviewTranscriptSchema.virtual("totalQuestions").get(function(this: IInterviewTranscript) {
  return this.questionsAnswers.length;
});

// Virtual for answered questions count
InterviewTranscriptSchema.virtual("answeredQuestions").get(function(this: IInterviewTranscript) {
  return this.questionsAnswers.filter(
    (qa) => qa.candidateAnswer && qa.candidateAnswer.trim() !== ""
  ).length;
});

// Instance methods
InterviewTranscriptSchema.methods.addQuestionAnswer = function(
  this: IInterviewTranscript,
  question: string,
  candidateAnswer: string,
  referenceAnswer?: string
): Promise<IInterviewTranscript> {
  this.questionsAnswers.push({
    question,
    candidateAnswer,
    referenceAnswer,
    answeredAt: new Date(),
  });
  return this.save();
};

InterviewTranscriptSchema.methods.updateStatus = function(
  this: IInterviewTranscript,
  status: IInterviewTranscript['interviewStatus']
): Promise<IInterviewTranscript> {
  this.interviewStatus = status;
  this.updatedBy = "SYSTEM";

  if (status === "IN_PROGRESS" && !this.startedAt) {
    this.startedAt = new Date();
  } else if (status === "COMPLETED" && !this.completedAt) {
    this.completedAt = new Date();
    this.totalDuration = this.calculatedDuration;
  }

  return this.save();
};

InterviewTranscriptSchema.methods.calculateOverallScore = function(this: IInterviewTranscript): number | null {
  const scoredQuestions = this.questionsAnswers.filter(
    (qa) => qa.score !== null && qa.score !== undefined
  );

  if (scoredQuestions.length === 0) {
    return null;
  }

  const totalScore = scoredQuestions.reduce((sum, qa) => sum + (qa.score || 0), 0);
  this.overallScore = Math.round((totalScore / scoredQuestions.length) * 100) / 100;

  return this.overallScore;
};

// Static methods
InterviewTranscriptSchema.statics.findByCandidate = function(
  candidateId: mongoose.Types.ObjectId
): Promise<IInterviewTranscript[]> {
  return this.find({ candidateId }).sort({ createdAt: -1 });
};

InterviewTranscriptSchema.statics.findByJob = function(
  jobId: mongoose.Types.ObjectId
): Promise<IInterviewTranscript[]> {
  return this.find({ jobId }).sort({ scheduledAt: -1 });
};

InterviewTranscriptSchema.statics.findByStatus = function(
  status: IInterviewTranscript['interviewStatus']
): Promise<IInterviewTranscript[]> {
  return this.find({ interviewStatus: status }).sort({ scheduledAt: -1 });
};

// Pre-save middleware
InterviewTranscriptSchema.pre('save', function(this: IInterviewTranscript, next) {
  // Auto-update totalDuration if interview is completed
  if (this.interviewStatus === "COMPLETED" && this.startedAt && this.completedAt) {
    this.totalDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
  }

  // Auto-calculate overall score if not set
  if (this.questionsAnswers.length > 0 && this.overallScore === null) {
    this.calculateOverallScore();
  }

  next();
});

// Create models with static methods interface
type InterviewTranscriptModel = Model<IInterviewTranscript> & IInterviewTranscriptStatics;

// Export the models
export const InterviewTranscript = mongoose.model<IInterviewTranscript, InterviewTranscriptModel>(
  "InterviewTranscript",
  InterviewTranscriptSchema
);

export const QAwithReference = mongoose.model<IQuestionAnswer>(
  "QAwithReference", 
  QuestionAnswerSchema
);
