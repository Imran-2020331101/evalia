const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
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
      info: mongoose.Schema.Types.Mixed,
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

module.exports = mongoose.model('Resume', resumeSchema);
