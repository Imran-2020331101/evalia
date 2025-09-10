import { z } from "zod";

// Contact information schema
export const ContactSchema = z.object({
  email: z.string().email().optional().default(""),
  phone: z.string().optional().default(""),
  linkedin: z.string().url().optional().or(z.literal("")).default(""),
  github: z.string().url().optional().or(z.literal("")).default(""),
  location: z.string().optional().default(""),
});

// Skills schema
export const SkillsSchema = z.object({
  technical: z.array(z.string()).optional().default([]),
  soft: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  tools: z.array(z.string()).optional().default([]),
  other: z.array(z.string()).optional().default([]),
});

// Experience schema
export const ExperienceSchema = z.object({
  company: z.string().optional().default(""),
  position: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  description: z.string().optional().default(""),
  technologies: z.array(z.string()).optional().default([]),
});

// Education schema
export const EducationSchema = z.object({
  institution: z.string().optional().default(""),
  degree: z.string().optional().default(""),
  field: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  gpa: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

// Project schema
export const ProjectSchema = z.object({
  name: z.string().optional().default(""),
  description: z.string().optional().default(""),
  technologies: z.array(z.string()).optional().default([]),
  link: z.string().url().optional().or(z.literal("")).default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
});

// Upload resume to cloud schema
export const UploadResumeSchema = z.object({
  userEmail: z.string().email("Valid email address is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Extract details from resume schema
export const ExtractDetailsSchema = z.object({
  resumeURL: z.string().url("Valid resume URL is required"),
});

// Save resume schema
export const SaveResumeSchema = z.object({
  resumeData: z.object({
    filename: z.string().min(1, "Filename is required"),
    originalName: z.string().optional().default("Unknown"), // Made optional
    fileLink: z.string().url("Valid file link is required"),
    industry: z.string().optional().default(""),
    skills: SkillsSchema.optional().default({}),
    experience: z.array(ExperienceSchema).optional().default([]),
    education: z.array(EducationSchema).optional().default([]),
    projects: z.array(ProjectSchema).optional().default([]),
    contact: ContactSchema.optional().default({}),
    certifications: z.array(z.string()).optional().default([]),
    awards: z.array(z.string()).optional().default([]),
    volunteer: z.array(z.string()).optional().default([]),
    interests: z.array(z.string()).optional().default([]),
    status: z
      .enum(["processing", "completed", "failed"])
      .optional()
      .default("completed"),
    uploadedBy: z.string().email("Valid uploader email is required"),
    processedAt: z.date().optional().default(new Date()),
  }),
  userId: z.string().min(1, "User ID is required"),
  userName: z.string().min(1, "User name is required"),
});

// Get resume by email schema
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
export type Contact = z.infer<typeof ContactSchema>;
export type Skills = z.infer<typeof SkillsSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type UploadResumeRequest = z.infer<typeof UploadResumeSchema>;
export type ExtractDetailsRequest = z.infer<typeof ExtractDetailsSchema>;
export type SaveResumeRequest = z.infer<typeof SaveResumeSchema>;
export type GetResumeByEmailRequest = z.infer<typeof GetResumeByEmailSchema>;
export type SearchCandidatesRequest = z.infer<typeof SearchCandidatesSchema>;
export type ResumeIdRequest = z.infer<typeof ResumeIdSchema>;

// Additional utility types
export type ResumeStatus = "processing" | "completed" | "failed";

export type ResumeData = {
  filename: string;
  originalName?: string;
  fileLink: string;
  industry?: string;
  skills?: Skills;
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  contact?: Contact;
  certifications?: string[];
  awards?: string[];
  volunteer?: string[];
  interests?: string[];
  status?: ResumeStatus;
  uploadedBy: string;
  processedAt?: Date;
};