import { z } from 'zod';

// Importance levels for job requirements, responsibilities, and skills
export const ImportanceLevel = z.enum(['critical', 'high', 'moderate', 'low', 'optional']);
export type ImportanceLevel = z.infer<typeof ImportanceLevel>;

// Job types
export const JobType = z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']);
export type JobType = z.infer<typeof JobType>;

// Workplace types
export const WorkplaceType = z.enum(['On-site', 'Remote', 'Hybrid']);
export type WorkplaceType = z.infer<typeof WorkplaceType>;

// Employment levels
export const EmploymentLevel = z.enum(['Entry', 'Mid', 'Senior', 'Executive', 'Director']);
export type EmploymentLevel = z.infer<typeof EmploymentLevel>;

// Job status
export const JobStatus = z.enum(['draft', 'active', 'paused', 'closed', 'filled']);
export type JobStatus = z.infer<typeof JobStatus>;

// Application status
export const ApplicationStatus = z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

// Domain item schema (for requirements, responsibilities, skills)
export const DomainItemSchema = z.object({
  type: ImportanceLevel,
  category: z.string().min(1, 'Category is required').trim(),
  description: z.string().min(1, 'Description is required').trim()
});
export type DomainItem = z.infer<typeof DomainItemSchema>;

// Salary schema
export const SalarySchema = z.object({
  from: z.number().min(0, 'Salary cannot be negative'),
  to: z.number().min(0, 'Salary cannot be negative')
}).refine((data: { from: number; to: number }) => data.to >= data.from, {
  message: 'Maximum salary must be greater than or equal to minimum salary'
});
export type Salary = z.infer<typeof SalarySchema>;

// Company schema
export const CompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').trim(),
  website: z.string().url('Please enter a valid website URL').optional(),
  industry: z.string().trim().optional()
});
export type Company = z.infer<typeof CompanySchema>;

// Application schema
export const ApplicationSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  appliedAt: z.date().optional(),
  status: ApplicationStatus.default('pending'),
  resumeId: z.string().optional()
});
export type Application = z.infer<typeof ApplicationSchema>;

// Base job schema
export const JobDetailsSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200, 'Job title cannot exceed 200 characters').trim(),
  jobDescription: z.string().min(1, 'Job description is required').max(5000, 'Job description cannot exceed 5000 characters').trim(),
  jobLocation: z.string().min(1, 'Job location is required').max(100, 'Job location cannot exceed 100 characters').trim(),
  salary: SalarySchema,
  deadline: z.date().refine((date: Date) => date > new Date(), {
    message: 'Deadline must be in the future'
  }),
  jobType: JobType,
  workPlaceType: WorkplaceType,
  employmentLevel: EmploymentLevel,
  requirements: z.array(DomainItemSchema).min(1, 'At least one requirement is required'),
  responsibilities: z.array(DomainItemSchema).min(1, 'At least one responsibility is required'),
  skills: z.array(DomainItemSchema).min(1, 'At least one skill is required'),
  postedBy: z.string().min(1, 'Job poster information is required'),
  company: CompanySchema,
  status: JobStatus.default('draft'),
  applications: z.array(ApplicationSchema).default([]),
  views: z.number().min(0).default(0),
  featured: z.boolean().default(false),
  tags: z.array(z.string().trim()).default([])
});
export type JobDetails = z.infer<typeof JobDetailsSchema>;

// Request schemas for API endpoints
export const CreateJobRequestSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  jobDescription: z.string().min(1).max(5000).trim(),
  jobLocation: z.string().min(1).max(100).trim(),
  salaryFrom: z.string().transform((val: string) => parseInt(val, 10)).pipe(z.number().min(0)),
  salaryTo: z.string().transform((val: string) => parseInt(val, 10)).pipe(z.number().min(0)),
  deadline: z.string().transform((str: string) => {
    // Handle dd-mm-yy format
    const dateParts = str.split('-');
    if (dateParts.length === 3) {
      const [day, month, year] = dateParts;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return new Date(`${fullYear}-${month}-${day}`);
    }
    return new Date(str);
  }).pipe(z.date()),
  jobType: JobType,
  workPlaceType: WorkplaceType,
  employmentLevel: EmploymentLevel,
  requirements: z.array(DomainItemSchema).min(1),
  responsibilities: z.array(DomainItemSchema).min(1),
  skills: z.array(DomainItemSchema).min(1),
  postedBy: z.string().min(1),
  company: CompanySchema
}).refine((data: { salaryFrom: number; salaryTo: number }) => data.salaryTo >= data.salaryFrom, {
  message: 'Maximum salary must be greater than or equal to minimum salary'
});
export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;

// Query parameters for job filtering
export const JobFilterSchema = z.object({
  status: JobStatus.optional(),
  page: z.string().optional().transform((val: string | undefined) => val ? parseInt(val, 10) : 1).pipe(z.number().min(1).default(1)),
  limit: z.string().optional().transform((val: string | undefined) => val ? parseInt(val, 10) : 10).pipe(z.number().min(1).max(100).default(10)),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
export type JobFilter = z.infer<typeof JobFilterSchema>;

// Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  details: z.array(z.string()).optional()
});
export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
};

// Pagination schema
export const PaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalCount: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
  limit: z.number()
});
export type Pagination = z.infer<typeof PaginationSchema>;
