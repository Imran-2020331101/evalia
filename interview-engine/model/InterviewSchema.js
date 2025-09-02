const mongoose = require("mongoose");
const { Schema } = mongoose;

// Individual question-answer pair schema
const QuestionAnswerSchema = new Schema(
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
      type: Number, // in seconds
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
const InterviewTranscriptSchema = new Schema(
  {
    // Interview identification
    interviewId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

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
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "SCHEDULED",
    },

    // Timing information
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
    },
    transcriptMetadata: {
      language: {
        type: String,
        default: "en-US",
      },
      confidence: {
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
InterviewTranscriptSchema.index({ status: 1, scheduledAt: -1 });
InterviewTranscriptSchema.index({ createdAt: -1 });
InterviewTranscriptSchema.index({ interviewId: 1 }, { unique: true });

// Virtual for calculated interview duration
InterviewTranscriptSchema.virtual("calculatedDuration").get(function () {
  if (this.startedAt && this.completedAt) {
    return Math.floor((this.completedAt - this.startedAt) / 1000); // in seconds
  }
  return 0;
});

// Virtual for total questions count
InterviewTranscriptSchema.virtual("totalQuestions").get(function () {
  return this.questionsAnswers.length;
});

// Virtual for answered questions count
InterviewTranscriptSchema.virtual("answeredQuestions").get(function () {
  return this.questionsAnswers.filter(
    (qa) => qa.candidateAnswer && qa.candidateAnswer.trim() !== ""
  ).length;
});

// Instance methods
InterviewTranscriptSchema.methods.addQuestionAnswer = function (
  question,
  candidateAnswer,
  referenceAnswer = null
) {
  this.questionsAnswers.push({
    question,
    candidateAnswer,
    referenceAnswer,
    answeredAt: new Date(),
  });
  return this.save();
};

InterviewTranscriptSchema.methods.updateStatus = function (status) {
  this.status = status;
  this.updatedBy = "SYSTEM";

  if (status === "IN_PROGRESS" && !this.startedAt) {
    this.startedAt = new Date();
  } else if (status === "COMPLETED" && !this.completedAt) {
    this.completedAt = new Date();
    this.totalDuration = this.calculatedDuration;
  }

  return this.save();
};

InterviewTranscriptSchema.methods.calculateOverallScore = function () {
  const scoredQuestions = this.questionsAnswers.filter(
    (qa) => qa.score !== null && qa.score !== undefined
  );

  if (scoredQuestions.length === 0) {
    return null;
  }

  const totalScore = scoredQuestions.reduce((sum, qa) => sum + qa.score, 0);
  this.overallScore =
    Math.round((totalScore / scoredQuestions.length) * 100) / 100;

  return this.overallScore;
};

// Static methods
InterviewTranscriptSchema.statics.findByCandidate = function (candidateId) {
  return this.find({ candidateId }).sort({ createdAt: -1 });
};

InterviewTranscriptSchema.statics.findByJob = function (jobId) {
  return this.find({ jobId }).sort({ scheduledAt: -1 });
};

InterviewTranscriptSchema.statics.findByStatus = function (status) {
  return this.find({ status }).sort({ scheduledAt: -1 });
};

// Pre-save middleware
InterviewTranscriptSchema.pre("save", function (next) {
  // Auto-update totalDuration if interview is completed
  if (this.status === "COMPLETED" && this.startedAt && this.completedAt) {
    this.totalDuration = Math.floor((this.completedAt - this.startedAt) / 1000);
  }

  // Auto-calculate overall score if not set
  if (this.questionsAnswers.length > 0 && this.overallScore === null) {
    this.calculateOverallScore();
  }

  next();
});

// Export the model
const InterviewTranscript = mongoose.model(
  "InterviewTranscript",
  InterviewTranscriptSchema
);

module.exports = InterviewTranscript;
