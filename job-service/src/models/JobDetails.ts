import mongoose, { Document, Model, Schema } from 'mongoose';
import { JobDetails, ImportanceLevel, DomainItem } from '../types/job.types';

// Document type from Zod type
export interface IJobDetailsDocument extends JobDetails, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  daysUntilDeadline: number | null;
  applicationCount: number;
  salaryRange: string | null;

  isActive(): boolean;
  getRequirementsByImportance(importance: ImportanceLevel): DomainItem[];
  getSkillsByImportance(importance: ImportanceLevel): DomainItem[];
}

// Model type
export interface IJobDetailsModel extends Model<IJobDetailsDocument> {
  findByFilters(filters: Partial<Pick<JobDetails, 'jobType' | 'workPlaceType' | 'employmentLevel'>> & {
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
  }): Promise<IJobDetailsDocument[]>;
}

// Sub-schema (minimal validation — Zod handles actual validation)
const DomainItemSchema = new Schema<DomainItem>(
  {
    type: { type: String },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

// Main schema
const JobDetailsMongooseSchema = new Schema<IJobDetailsDocument>(
  {
    title:{type:String, trim:true},
    jobDescription: { type: String, trim: true },
    jobLocation: { type: String, trim: true },
    salary: {
      from: { type: Number },
      to: { type: Number },
    },
    deadline: { type: Date },
    jobType: { type: String },
    workPlaceType: { type: String },
    employmentLevel: { type: String },
    requirements: { type: [DomainItemSchema], default: [] },
    responsibilities: { type: [DomainItemSchema], default: [] },
    skills: { type: [DomainItemSchema], default: [] },
    postedBy: { type: String },
    company: {
      OrganizationId    : { type: String },
      OrganizationEmail : {type: String}
    },
    status: { 
      type    : String ,
      enum    : ['DRAFT','ACTIVE','FILLED','ARCHIVED','DELETED'],
      default : 'ACTIVE',
    },
    applications: {
      type: [
        {
          candidateName: {type:String},
          candidateEmail: { type: String },
          appliedAt: { type: Date, default: Date.now },
          status: {
            type    : String,
            enum    : ['PENDING', 'SHORTLISTED', 'REJECTED', 'HIRED'],
            default : 'PENDING',
          },
        },
      ],
      default: [],
    },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    interviewQA: {
      type: [
        {
          question: { type: String },
          referenceAnswer: { type: String },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
JobDetailsMongooseSchema.index({ title: 'text', jobDescription: 'text' });
JobDetailsMongooseSchema.index({ jobType: 1, workPlaceType: 1, employmentLevel: 1 });
JobDetailsMongooseSchema.index({ 'company.name': 1 });
JobDetailsMongooseSchema.index({ status: 1, deadline: 1 });
JobDetailsMongooseSchema.index({ createdAt: -1 });

// Virtuals
JobDetailsMongooseSchema.virtual('daysUntilDeadline').get(function () {
  if (!this.deadline) return null;
  const diffTime = this.deadline.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

JobDetailsMongooseSchema.virtual('applicationCount').get(function () {
  return this.applications.length;
});

JobDetailsMongooseSchema.virtual('salaryRange').get(function () {
  return this.salary ? `$${this.salary.from}k - $${this.salary.to}k` : null;
});

// Instance methods
JobDetailsMongooseSchema.methods.isActive = function () {
  return this.status === 'ACTIVE' && new Date() < this.deadline;
};

JobDetailsMongooseSchema.methods.getRequirementsByImportance = function (importance: ImportanceLevel) {
  return this.requirements.filter((req: { type: ImportanceLevel; }) => req.type === importance);
};

JobDetailsMongooseSchema.methods.getSkillsByImportance = function (importance: ImportanceLevel) {
  return this.skills.filter((skill: { type: ImportanceLevel; }) => skill.type === importance);
};

// Static methods
JobDetailsMongooseSchema.statics.findByFilters = function (filters) {
  const query: any = { status: 'ACTIVE' };
  if (filters.jobType) query.jobType = filters.jobType;
  if (filters.workPlaceType) query.workPlaceType = filters.workPlaceType;
  if (filters.employmentLevel) query.employmentLevel = filters.employmentLevel;
  if (filters.location) query.jobLocation = new RegExp(filters.location, 'i');
  if (filters.salaryMin) query['salary.from'] = { $gte: filters.salaryMin };
  if (filters.salaryMax) query['salary.to'] = { $lte: filters.salaryMax };
  return this.find(query);
};

// Pre-save middleware
JobDetailsMongooseSchema.pre('save', function (next) {
  if (!this.tags || this.tags.length === 0) {
    const tags: string[] = [
      this.jobType?.toLowerCase(),
      this.workPlaceType?.toLowerCase(),
      this.employmentLevel?.toLowerCase(),
    ].filter(Boolean);

    this.skills.forEach((skill) => {
      if (skill.category && !tags.includes(skill.category.toLowerCase())) {
        tags.push(skill.category.toLowerCase());
      }
    });

    this.tags = tags;
  }
  next();
});

// Export model
export const JobDetailsModel = mongoose.model<IJobDetailsDocument, IJobDetailsModel>(
  'JobDetails',
  JobDetailsMongooseSchema
);

export default JobDetailsModel;
