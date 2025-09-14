import mongoose, { Schema, Model } from 'mongoose';
import { 
  IQuestionAnswer, 
  IInterview, 
  IInterviewTranscriptStatics 
} from '../types/interview.types';

// Individual question-answer pair schema
const QuestionAnswerSchema = new Schema<IQuestionAnswer>(
  {
    question: { type: String, required: true, trim: true },
    candidateAnswer: { type: String, required: false, trim: true },
    referenceAnswer: { type: String, required: false, trim: true },
    score: { type: Number, min: 0, max: 10, default: null },
    feedback: { type: String, trim: true },
    duration: { type: Number, default: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

export enum InterviewStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

// Main interview transcript schema
const InterviewTranscriptSchema = new Schema<IInterview>(
  {
    // Candidate information
    candidateId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    candidateEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    candidateName: { type: String, required: true, trim: true },

    // Job info
    jobId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    jobTitle: { type: String, required: true, trim: true },

    //Organization info
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: false, index: true },

    // Interview details
    interviewType: { type: String, enum: ["TECHNICAL", "BEHAVIORAL", "MIXED", "SCREENING"], default: "TECHNICAL" },
    interviewStatus: { type: String, enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"], default: "SCHEDULED" },
    deadline: { type: Date, required: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    allowedDuration: { type: Number, default: 15}, // setted time for the interview (in minuets)
    totalDuration: { type: Number, default: 0 }, // in minuets

    // Transcript the audio of the interview
    questionsAnswers: { type: [QuestionAnswerSchema], default: [] },

    // Overall assessment
    summary: { type: String, default: "" },
    overallScore: { type: Number, min: 0, max: 10, default: null },
    overallFeedback: { type: String, trim: true, default: null },
    recommendation: { type: String, enum: ["STRONG_HIRE", "HIRE", "NO_HIRE", "STRONG_NO_HIRE", "PENDING"], default: "PENDING" },

    // Technical metadata
    recordingUrl: { type: String, trim: true, default: null },
    transcriptMetadata: {
      language: { type: String, default: "en-US" },
      integrity: { type: Number, min: 0, max: 1 },
      processingTime: { type: Number }, // in milliseconds
    },

    // Audit fields
    createdBy: { type: String, default: "SYSTEM" },
    updatedBy: { type: String, default: "SYSTEM" },

    // Additional notes
    notes: { type: String, trim: true },
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
InterviewTranscriptSchema.virtual("calculatedDuration").get(function(this: IInterview) {
  if (this.startedAt && this.completedAt) {
    return Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000); // in seconds
  }
  return 0;
});

// Virtual for total questions count
InterviewTranscriptSchema.virtual("totalQuestions").get(function(this: IInterview) {
  return this.questionsAnswers.length;
});



// Instance methods
InterviewTranscriptSchema.methods.addQuestionAnswer = function(
  this: IInterview,
  question: string,
  candidateAnswer: string,
  referenceAnswer?: string
): Promise<IInterview> {
  this.questionsAnswers.push({
    question,
    candidateAnswer,
    referenceAnswer,
    answeredAt: new Date(),
  });
  return this.save();
};

InterviewTranscriptSchema.methods.updateStatus = function(
  this: IInterview,
  status: IInterview['interviewStatus']
): Promise<IInterview> {
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



// Static methods
InterviewTranscriptSchema.statics.findByCandidate = function(
  candidateId: mongoose.Types.ObjectId
): Promise<IInterview[]> {
  return this.find({ candidateId }).sort({ createdAt: -1 });
};

InterviewTranscriptSchema.statics.findByJob = function(
  jobId: mongoose.Types.ObjectId
): Promise<IInterview[]> {
  return this.find({ jobId }).sort({ scheduledAt: -1 });
};

InterviewTranscriptSchema.statics.findByStatus = function(
  status: IInterview['interviewStatus']
): Promise<IInterview[]> {
  return this.find({ interviewStatus: status }).sort({ scheduledAt: -1 });
};

// // Pre-save middleware
// InterviewTranscriptSchema.pre('save', function(this: IInterview, next) {
//   // Auto-update totalDuration if interview is completed
//   if (this.interviewStatus === "COMPLETED" && this.startedAt && this.completedAt) {
//     this.totalDuration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
//   }

//   // Auto-calculate overall score if not set
//   if (this.questionsAnswers.length > 0 && this.overallScore === null) {
//     this.calculateOverallScore();
//   }

//   next();
// });

// Create models with static methods interface
type InterviewTranscriptModel = Model<IInterview> & IInterviewTranscriptStatics;

// Export the models
export const Interview = mongoose.model<IInterview, InterviewTranscriptModel>(
  "InterviewTranscript",
  InterviewTranscriptSchema
);

export const QAwithReference = mongoose.model<IQuestionAnswer>(
  "QAwithReference", 
  QuestionAnswerSchema
);
