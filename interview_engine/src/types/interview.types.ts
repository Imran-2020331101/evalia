import {z} from 'zod';
import { Document, Types } from 'mongoose';
import { id } from 'zod/v4/locales/index.cjs';

// Individual question-answer pair interface
export interface IQuestionAnswer {
  _id?: Types.ObjectId;
  question: string;
  candidateAnswer: string | null;
  referenceAnswer?: string;
  score?: number;
  feedback?: string;
  duration?: number;
  answeredAt?: Date;
}

// Main interview Object interface
export interface IInterview extends Document {
  // Candidate information
  candidateId: Types.ObjectId;
  candidateEmail: string;
  candidateName: string;

  // Job information
  jobId: Types.ObjectId;
  jobTitle: string;

  // Organization info
  organizationId: Types.ObjectId;

  // Interview details
  interviewType: 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED' | 'SCREENING';
  interviewStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  deadline: Date;
  startedAt?: Date;
  completedAt?: Date;
  allowedDuration?: number;
  totalDuration: number;

  // Questions and answers
  questionsAnswers: IQuestionAnswer[];

  // Overall assessment
  summary : string;
  overallScore?: number;
  overallFeedback?: string;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE' | 'PENDING';

  // Technical metadata
  recordingUrl?: string;
  transcriptMetadata?: {
    language: string;
    integrity?: number;
    processingTime?: number;
  };

  // Audit fields
  createdBy: string;
  updatedBy: string;

  // Additional notes
  notes?: string;

  // Virtual fields (computed at runtime)
  calculatedDuration: number;
  totalQuestions: number;
  answeredQuestions: number;

  // Instance methods
  addQuestionAnswer(question: string, candidateAnswer: string, referenceAnswer?: string): Promise<IInterview>;
  updateStatus(status: IInterview['interviewStatus']): Promise<IInterview>;
  calculateOverallScore(): number | null;
}

// Job service response interface
export interface IJobResponse {
  success: boolean;
  data: {
    _id: string;
    title: string;
    jobDescription: string;
    jobLocation: string;
    deadline: string;
    jobType: string;
    workPlaceType: string;
    employmentLevel: string;
    salary: {
      from: number;
      to: number;
    };
    company: {
      OrganizationId: string;
      OrganizationEmail: string;
    };
    requirements: any[];
    responsibilities: any[];
    skills: any[];
    postedBy: string;
    status: string;
    views: number;
    featured: boolean;
    tags: string[];
    interviewQA: Array<{
      question: string;
      referenceAnswer: string;
    }>;
    applications: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    daysUntilDeadline: number;
    applicationCount: number;
    salaryRange: string;
    id: string;
  };
}

// API Request interfaces

export const ScheduleInterviewRequest = z.object({
    candidate : z.object({
        id    : z.string(),
        email : z.string(),
        name  : z.string(),
    }),
    job : z.object({
        id    : z.string(),
        title : z.string(),
        interviewQA : z.array(z.object({
          question: z.string(),
          referenceAnswer: z.string().optional(),
        }).loose())
    }),
    organization : z.object({
        id    : z.string(),
    }),
    deadline: z.string(),
    allowedDuration: z.number().optional(), // duration setted by the recruiter. default = 15 min
}).loose();

export type IScheduleInterviewRequest = z.infer<typeof ScheduleInterviewRequest>;

export interface IScheduleInterviewResponse {
  success: boolean;
  message: string;
  data?: {
    interviewId: string;
    candidateId: string;
    jobId: string;
    jobTitle: string;
    deadline: Date;
    totalQuestions: number;
    status: string;
  };
  errors?: string[];
}

// Socket.IO interfaces
export interface IVideoFrameData {
  interviewId: string;
  frame: string;
}

export interface IntegrityMetrics {
  faceCount: number;
  eyeContact: number;
  speaking: number;
  blinkRate: number;
}

export interface IPythonMetricsResult {
  interviewId: string;
  metrics: IntegrityMetrics;
}

// Static methods interface for the model
export interface IInterviewTranscriptStatics {
  findByCandidate(candidateId: Types.ObjectId): Promise<IInterview[]>;
  findByJob(jobId: Types.ObjectId): Promise<IInterview[]>;
  findByStatus(status: IInterview['interviewStatus']): Promise<IInterview[]>;
}

export type IntegrityUpdateResponse = {
  interviewId: string;
  instantScore: number;
  aggregateScore: number;   // time-averaged score with penalties
  smoothedScore: number;    // EWMA-based combined score
  sampleCount: number;
  violations: {
    multipleFaces: boolean;
    absent: boolean;
    lowEyeContact: boolean;
  };
};

export interface InterviewIntegrityState {
  startedAt: number;
  lastUpdatedAt: number;
  sampleCount: number;

  // running sums for simple average
  sumFaceScore: number;
  sumGazeScore: number;
  sumSpeakScore: number;
  sumBlinkScore: number;

  // EWMA (smoothed) values for each sub-score
  ewmaFace: number;
  ewmaGaze: number;
  ewmaSpeak: number;
  ewmaBlink: number;

  // extremes & events
  minInstantScore: number;
  maxInstantScore: number;

  // sustained violation counters (seconds)
  multipleFaceSeconds: number;
  absentSeconds: number;
  lowEyeContactSeconds: number;

  // flags
  violatedMultipleFaces: boolean;
  violatedAbsent: boolean;
  violatedLowEyeContact: boolean;
}