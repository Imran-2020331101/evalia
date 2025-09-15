import { z } from "zod";
import { Request } from "express";
import { ResumeAnalysis } from "@/services/resumeService";

// Industry type enum schema
export const IndustryTypeSchema = z.enum([
  'STEM & Technical',
  'Business, Finance & Administration',
  'Creative, Media & Communication',
  'Education, Social & Legal Services',
  'Skilled Trades, Labor & Services',
  'Others',
]).or(z.literal(''));

export const ResumeStatusSchema = z.enum(['processing', 'completed', 'failed']);

export const MetadataSchema = z.object({
  pages: z.number().optional(),
  info: z.any().optional(),
  version: z.string().optional(),
});

export const AnalysisSchema = z.object({
  wordCount: z.number().optional(),
  characterCount: z.number().optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  sections: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});


export const ContactSchema = z.object({
  email: z.string().email().optional().default(""),
  phone: z.string().optional().default(""),
  linkedin: z.string().url().optional().or(z.literal("")).default(""),
  github: z.string().url().optional().or(z.literal("")).default(""),
  location: z.string().optional().default(""),
});

export const SkillsSchema = z.object({
  technical: z.array(z.string()).optional().default([]),
  soft: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  tools: z.array(z.string()).optional().default([]),
  other: z.array(z.string()).optional().default([]),
});

export const ExperienceSchema = z.object({
  job_title: z.string().optional().default(""),
  company: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  description: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
});

export const EducationSchema = z.object({
  degree: z.string().optional().default(""),
  institution: z.string().optional().default(""),
  year: z.string().optional().default(""),
  gpa: z.string().optional().default(""),
});

export const ProjectSchema = z.object({
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  technologies: z.array(z.string()).optional().default([]),
  url: z.string().url().optional().or(z.literal("")).default(""),
});

export const CertificationSchema = z.object({
  title: z.string().optional().default(""),
  provider: z.string().optional().default(""),
  date: z.string().optional().default(""),
  link: z.string().url().optional().or(z.literal("")).default(""),
});

export const AwardSchema = z.object({
  title: z.string().optional().default(""),
  organization: z.string().optional().default(""),
  year: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export const UploadResumeSchema = z.object({
  userEmail: z.string().email("Valid email address is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const ExtractDetailsSchema = z.object({
  resumeURL: z.string().url("Valid resume URL is required"),
  userEmail: z.string(),
  userId   : z.string(),
});

export const SaveResumeSchema = z.object({
  resumeData: z.object({
    filename: z.string().min(1, "Filename is required"),
    fileLink: z.string().url("Valid file link is required"),
    metadata: MetadataSchema.optional(),
    industry: IndustryTypeSchema.optional(),
    analysis: AnalysisSchema.optional(),
    skills: SkillsSchema.optional().default({}),
    experience: z.array(ExperienceSchema).optional().default([]),
    education: z.array(EducationSchema).optional().default([]),
    projects: z.array(ProjectSchema).optional().default([]),
    certifications: z.array(CertificationSchema).optional().default([]),
    awards: z.array(AwardSchema).optional().default([]),
    volunteer: z.array(z.string()).optional().default([]),
    interests: z.array(z.string()).optional().default([]),
    contact: ContactSchema.optional().default({}),
    uploadedBy: z.string().email("Valid uploader email is required"),
    uploadedAt: z.date().optional().default(new Date()),
    processedAt: z.date().optional().default(new Date()),
    status: ResumeStatusSchema.optional().default("completed"),
  }),
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
}).passthrough();


export const GetResumeByEmailSchema = z.object({
  email: z.string().email("Valid email address is required"),
});

// Search candidates schema
export const SearchCandidatesSchema = z.object({
  job_description: z
    .string()
    .min(10, "Job description must be at least 10 characters long"),
});

// Resume ID parameter schema
export const ResumeIdSchema = z.object({
  id: z.string().min(1, "Resume ID is required"),
});


// TypeScript type definitions inferred from Zod schemas
export type IndustryType = z.infer<typeof IndustryTypeSchema>;
export type ResumeStatus = z.infer<typeof ResumeStatusSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Award = z.infer<typeof AwardSchema>;
export type GetResumeByEmailRequest = z.infer<typeof GetResumeByEmailSchema>;
export type ResumeIdRequest = z.infer<typeof ResumeIdSchema>;

// Main ResumeData type that matches the MongoDB model structure
export type ResumeData = {
  filename: string;
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
};

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Resume Data Transfer Object for API responses and frontend communication
 * Consolidated from separate DTO file to maintain single source of truth
 */
export class ResumeDTO {
  filename: string;
  fileLink: string;
  industry: IndustryType;
  skills: Required<Skills>;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  contact: Required<Contact>;
  certifications: Certification[];
  awards: Award[];
  volunteer: string[];
  interests: string[];
  status: ResumeStatus;
  metadata?: Metadata;
  analysis?: Analysis;
  uploadedBy: string;
  processedAt: Date;  


  constructor(data: ResumeAnalysis) {
    this.filename = "";
    this.fileLink = "";
    this.industry = data.industry || 'Others';
    this.skills = {
      technical: data.skills?.technical || [],
      soft: data.skills?.soft || [],
      languages: data.skills?.languages || [],
      tools: data.skills?.tools || [],
      other: data.skills?.other || [],
    };
    this.experience = data.experience || [];
    this.education = data.education || [];
    this.projects = data.projects || [];
    this.contact = {
      email: data.email || "",
      phone: data.phone || "",
      linkedin: data.linkedin || "",
      github: data.github || "",
      location: data.location || "",
    };
    this.certifications = data.certifications || [];
    this.awards = data.awards || [];
    this.volunteer = data.volunteer || [];
    this.interests = data.interests || [];
    this.status = "completed";
    this.metadata = {
      pages: 0,
      info: null,
      version: "1.0",
    }
    this.uploadedBy = "";
    this.processedAt = new Date;

    this.analysis = {
      wordCount: data.wordCount,
      characterCount: data.characterCount,
      hasPhone: data.hasPhone,
      keywords: data.keywords,
    }
  }

  /**
   * Validate required fields for display
   */
  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.filename) errors.push("filename is required");
    if (!this.fileLink) errors.push("fileLink is required");

    if (this.contact.email && !this.isValidEmail(this.contact.email)) {
      errors.push("Invalid email format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Helper method to validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to plain object for frontend
   */
  toObject(): Record<string, any> {
    return {
      filename: this.filename,
      fileLink: this.fileLink,
      industry: this.industry,
      skills: this.skills,
      experience: this.experience,
      education: this.education,
      projects: this.projects,
      contact: this.contact,
      certifications: this.certifications,
      awards: this.awards,
      volunteer: this.volunteer,
      interests: this.interests,
      status: this.status,
    };
  }

  /**
   * Get a summary of the resume for quick overview
   */
  getSummary(): {
    hasContact: boolean;
    skillsCount: number;
    experienceCount: number;
    educationCount: number;
    projectsCount: number;
    certificationsCount: number;
    completeness: number;
  } {
    const hasContact = !!(this.contact.email || this.contact.phone);
    const skillsCount = Object.values(this.skills)
      .reduce((total, skillArray) => total + skillArray.length, 0);
    
    const completeness = this.calculateCompleteness();

    return {
      hasContact,
      skillsCount,
      experienceCount: this.experience.length,
      educationCount: this.education.length,
      projectsCount: this.projects.length,
      certificationsCount: this.certifications.length,
      completeness,
    };
  }

  /**
   * Calculate completeness percentage based on filled fields
   */
  private calculateCompleteness(): number {
    const fields = [
      !!this.filename,
      !!this.fileLink,
      !!this.industry && this.industry !== 'Others',
      this.skills.technical.length > 0,
      this.experience.length > 0,
      this.education.length > 0,
      !!this.contact.email,
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  /**
   * Create from database object
   */
  static fromObject(obj: any): ResumeDTO {
    return new ResumeDTO(obj);
  }

  /**
   * Create multiple DTOs from array
   */
  static fromArray(objects: any[]): ResumeDTO[] {
    return objects.map(obj => new ResumeDTO(obj));
  }
}