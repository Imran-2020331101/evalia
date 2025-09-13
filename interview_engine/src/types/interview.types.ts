import {z} from 'zod';
import { Document, Types } from 'mongoose';
import { id } from 'zod/v4/locales/index.cjs';

// Individual question-answer pair interface
export interface IQuestionAnswer {
  _id?: Types.ObjectId;
  question: string;
  candidateAnswer: string;
  referenceAnswer?: string;
  score?: number;
  feedback?: string;
  duration?: number;
  answeredAt?: Date;
}

// Main interview transcript interface
export interface IInterviewTranscript extends Document {
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
  addQuestionAnswer(question: string, candidateAnswer: string, referenceAnswer?: string): Promise<IInterviewTranscript>;
  updateStatus(status: IInterviewTranscript['interviewStatus']): Promise<IInterviewTranscript>;
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
  findByCandidate(candidateId: Types.ObjectId): Promise<IInterviewTranscript[]>;
  findByJob(jobId: Types.ObjectId): Promise<IInterviewTranscript[]>;
  findByStatus(status: IInterviewTranscript['interviewStatus']): Promise<IInterviewTranscript[]>;
}
