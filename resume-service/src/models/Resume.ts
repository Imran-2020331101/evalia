import mongoose, { Schema, Document, Model } from 'mongoose';

// Type definitions for resume data
type IndustryType = 
  | 'STEM & Technical'
  | 'Business, Finance & Administration'
  | 'Creative, Media & Communication'
  | 'Education, Social & Legal Services'
  | 'Skilled Trades, Labor & Services'
  | 'Others';

type ResumeStatus = 'processing' | 'completed' | 'failed';

interface Metadata {
  pages?: number;
  info?: any;
  version?: string;
}

interface Analysis {
  wordCount?: number;
  characterCount?: number;
  hasEmail?: boolean;
  hasPhone?: boolean;
  sections?: string[];
  keywords?: string[];
}

interface Skills {
  technical?: string[];
  soft?: string[];
  languages?: string[];
  tools?: string[];
  other?: string[];
}

interface Experience {
  job_title?: string;
  company?: string;
  duration?: string;
  description?: string[];
  achievements?: string[];
}

interface Education {
  degree?: string;
  institution?: string;
  year?: string;
  gpa?: string;
}

interface Project {
  title?: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

interface Certification {
  title?: string;
  provider?: string;
  date?: string;
  link?: string;
}

interface Award {
  title?: string;
  organization?: string;
  year?: string;
  description?: string;
}

interface Contact {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
}

// Main Resume interface extending MongoDB Document
export interface IResume extends Document {
  filename: string;
  originalName?: string;
  fileLink: string;
  metadata?: Metadata;
  industry?: IndustryType;
  analysis?: Analysis;
  skills?: Skills;
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  certifications?: Certification[];
  awards?: Award[];
  volunteer?: string[];
  interests?: string[];
  contact?: Contact;
  uploadedBy: string;
  uploadedAt?: Date;
  processedAt?: Date;
  status?: ResumeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Resume Schema definition
const resumeSchema = new Schema<IResume>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      // required: true,
    },
    fileLink: {
      type: String,
      required: true,
    },
    metadata: {
      pages: Number,
      info: Schema.Types.Mixed,
      version: String,
    },

    industry: {
      type: String,
      enum: [
        'STEM & Technical',
        'Business, Finance & Administration',
        'Creative, Media & Communication',
        'Education, Social & Legal Services',
        'Skilled Trades, Labor & Services',
        'Others',
      ],
    },

    analysis: {
      wordCount: Number,
      characterCount: Number,
      hasEmail: Boolean,
      hasPhone: Boolean,
      sections: [String],
      keywords: [String],
    },

    skills: {
      technical: [String],
      soft: [String],
      languages: [String],
      tools: [String],
      other: [String],
    },

    experience: [
      {
        job_title: String,
        company: String,
        duration: String,
        description: [String],
        achievements: [String],
      },
    ],

    education: [
      {
        degree: String,
        institution: String,
        year: String,
        gpa: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        url: String,
      },
    ],
    certifications: [
      {
        title: String,
        provider: String,
        date: String,
        link: String,
      },
    ],
    awards: [
      {
        title: String,
        organization: String,
        year: String,
        description: String,
      },
    ],
    volunteer: [String],
    interests: [String],

    contact: {
      email: String,
      phone: String,
      linkedin: String,
      github: String,
      location: String,
    },

    uploadedBy: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
resumeSchema.index({ uploadedAt: -1 });
resumeSchema.index({ uploadedBy: 1 });
resumeSchema.index({ status: 1 });

// Indexes for structured data queries
resumeSchema.index({ 'skills.technical': 1 });
resumeSchema.index({ 'experience.totalYearsEstimate': 1 });
resumeSchema.index({ 'experience.companies': 1 });
resumeSchema.index({ 'education.degrees': 1 });
resumeSchema.index({ 'contact.emails': 1 });

// Create and export the model with proper TypeScript typing
const Resume: Model<IResume> = mongoose.model<IResume>('Resume', resumeSchema);

export default Resume;
export {
  IndustryType,
  ResumeStatus,
  Metadata,
  Analysis,
  Skills,
  Experience,
  Education,
  Project,
  Certification,
  Award,
  Contact,
};