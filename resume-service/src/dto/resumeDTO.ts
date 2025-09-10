// Type definitions for Resume DTO
type IndustryType = 
  | 'STEM & Technical'
  | 'Business, Finance & Administration'
  | 'Creative, Media & Communication'
  | 'Education, Social & Legal Services'
  | 'Skilled Trades, Labor & Services'
  | 'Others'
  | '';

type ResumeStatus = 'processing' | 'completed' | 'failed';

interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  tools: string[];
  other: string[];
}

interface Experience {
  job_title: string;
  company: string;
  duration: string;
  description: string[];
  achievements: string[];
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  url: string;
}

interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
}

interface Certification {
  title: string;
  provider: string;
  date: string;
  link: string;
}

interface Award {
  title: string;
  organization: string;
  year: string;
  description: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Input data interface for constructor
interface ResumeDataInput {
  filename?: string;
  originalName?: string;
  fileLink?: string;
  industry?: IndustryType;
  skills?: Partial<Skills>;
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  contact?: Partial<Contact>;
  certifications?: Certification[];
  awards?: Award[];
  volunteer?: string[];
  interests?: string[];
  status?: ResumeStatus;
}

/**
 * Resume Data Transfer Object for API responses and frontend communication
 */
class ResumeDTO {
  filename: string;
  originalName: string;
  fileLink: string;
  industry: IndustryType;
  skills: Skills;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  contact: Contact;
  certifications: Certification[];
  awards: Award[];
  volunteer: string[];
  interests: string[];
  status: ResumeStatus;

  constructor(data: ResumeDataInput = {}) {
    this.filename = data.filename || "";
    this.originalName = data.originalName || "";
    this.fileLink = data.fileLink || "";
    this.industry = data.industry || "";
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
      email: data.contact?.email || "",
      phone: data.contact?.phone || "",
      linkedin: data.contact?.linkedin || "",
      github: data.contact?.github || "",
      location: data.contact?.location || "",
    };
    this.certifications = data.certifications || [];
    this.awards = data.awards || [];
    this.volunteer = data.volunteer || [];
    this.interests = data.interests || [];
    this.status = data.status || "completed";
  }

  /**
   * Validate required fields for display
   * @returns ValidationResult with validation status and error messages
   */
  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.filename) errors.push("filename is required");
    if (!this.fileLink) errors.push("fileLink is required");

    // Optional: Add more validation rules as needed
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
   * @param email - Email string to validate
   * @returns Boolean indicating if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Method to convert to plain object for frontend
   * @returns Plain object representation of the DTO
   */
  toObject(): Record<string, any> {
    return {
      filename: this.filename,
      originalName: this.originalName,
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
   * @returns Summary object with key metrics
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
   * @returns Completeness percentage (0-100)
   */
  private calculateCompleteness(): number {
    const fields = [
      !!this.filename,
      !!this.fileLink,
      !!this.industry,
      this.skills.technical.length > 0,
      this.experience.length > 0,
      this.education.length > 0,
      !!this.contact.email,
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  /**
   * Static method to create from database object
   * @param obj - Database object or any object with resume data
   * @returns New ResumeDTO instance
   */
  static fromObject(obj: any): ResumeDTO {
    return new ResumeDTO(obj);
  }

  /**
   * Static method to create multiple DTOs from array
   * @param objects - Array of database objects
   * @returns Array of ResumeDTO instances
   */
  static fromArray(objects: any[]): ResumeDTO[] {
    return objects.map(obj => new ResumeDTO(obj));
  }
}

export default ResumeDTO;
export {
  IndustryType,
  ResumeStatus,
  Skills,
  Experience,
  Education,
  Project,
  Contact,
  Certification,
  Award,
  ValidationResult,
  ResumeDataInput,
};