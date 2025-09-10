// Import ResumeDTO - using require for compatibility with existing JS DTO
const ResumeDTO = require("../dto/ResumeDTO");

// Type definitions for Resume data structures
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
  gpa?: number;
}

interface Project {
  title?: string;
  description?: string;
  technologies?: string[];
  url?: string | null;
}

interface Contact {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
}

interface Certification {
  title?: string;
  provider?: string;
  date?: string;
  link?: string;
}

// Search result interfaces
interface SearchResult {
  candidateEmail: string;
  candidateId?: string;
  candidateName?: string;
  section: 'skills' | 'experience' | 'projects' | 'education';
  score: number;
}

interface CandidateScore {
  score: number;
  details?: any[];
}

interface CandidateExperience extends CandidateScore {
  years: number;
  companies: string[];
}

interface CandidateProjects extends CandidateScore {
  count: number;
  projects: any[];
}

interface CandidateEducation extends CandidateScore {
  degree: string;
  institution: string;
  gpa: number;
}

interface AggregatedCandidate {
  id: string;
  name: string;
  email: string;
  skills: CandidateScore;
  experience: CandidateExperience;
  projects: CandidateProjects;
  education: CandidateEducation;
  totalScore: number;
}

// Resume source interface for mapping
interface ResumeSource {
  filename?: string;
  originalName?: string;
  fileLink?: string;
  industry?: string;
  skills?: Skills;
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  contact?: Contact;
  certifications?: Certification[];
  awards?: string[];
  volunteer?: any[];
  interests?: string[];
  status?: string;
}

// Helper function to convert skills object to string
function skillsToString(skills?: Skills): string {
  if (!skills) return "";

  const parts: string[] = [];
  if (skills.technical && skills.technical.length > 0) {
    parts.push(skills.technical.join(" "));
  }
  if (skills.soft && skills.soft.length > 0) {
    parts.push(skills.soft.join(" "));
  }
  if (skills.languages && skills.languages.length > 0) {
    parts.push(skills.languages.join(" "));
  }
  if (skills.tools && skills.tools.length > 0) {
    parts.push(skills.tools.join(" "));
  }
  if (skills.other && skills.other.length > 0) {
    parts.push(skills.other.join(" "));
  }

  return parts.join(" ");
}

// Helper function to convert education array to string
function educationToString(education?: Education[]): string {
  if (!education || !Array.isArray(education)) return "";

  return education
    .map((edu) => {
      const parts: string[] = [];
      if (edu.degree) parts.push(edu.degree);
      if (edu.institution) parts.push(edu.institution);
      if (edu.gpa) parts.push("CGPA :" + edu.gpa);
      return parts.join(" ");
    })
    .join(" ");
}

// Helper function to convert projects array to string
function projectsToString(projects?: Project[]): string {
  if (!projects || !Array.isArray(projects)) return "";

  return projects
    .map((project) => {
      const parts: string[] = [];
      if (project.title) parts.push(project.title);
      if (project.description) parts.push(project.description);
      if (project.technologies && project.technologies.length > 0) {
        parts.push(project.technologies.join(" "));
      }
      return parts.join(" ");
    })
    .join(" ");
}

// Helper function to convert experience array to string
function experienceToString(experience?: Experience[]): string {
  if (!experience || !Array.isArray(experience)) return "";

  return experience
    .map((exp) => {
      const parts: string[] = [];
      if (exp.job_title) parts.push(exp.job_title);
      if (exp.company) parts.push(exp.company);
      if (exp.duration) parts.push(exp.duration);
      if (exp.description && exp.description.length > 0) {
        parts.push(exp.description.join(" "));
      }
      if (exp.achievements && exp.achievements.length > 0) {
        parts.push(exp.achievements.join(" "));
      }
      return parts.join(" ");
    })
    .join(" ");
}

// Utility function to aggregate search results by candidate
function aggregateResultsByCandidate(searchResults: SearchResult[]): AggregatedCandidate[] {
  const candidateMap: { [email: string]: AggregatedCandidate } = {};

  // Initialize or update candidate scores
  searchResults.forEach((result) => {
    const email = result.candidateEmail;

    if (!candidateMap[email]) {
      candidateMap[email] = {
        id: result.candidateId || "default Id",
        name: result.candidateName || "name not found",
        email: email,
        skills: { score: 0, details: [] },
        experience: { score: 0, years: 0, companies: [] },
        projects: { score: 0, count: 0, projects: [] },
        education: { score: 0, degree: "", institution: "", gpa: 0 },
        totalScore: 0,
      };
    }

    // Add score to the appropriate section
    switch (result.section) {
      case "skills":
        candidateMap[email].skills.score += result.score;
        break;
      case "experience":
        candidateMap[email].experience.score += result.score;
        break;
      case "projects":
        candidateMap[email].projects.score += result.score;
        break;
      case "education":
        candidateMap[email].education.score += result.score;
        break;
    }
  });

  // Calculate total scores and convert to array
  const candidates = Object.values(candidateMap).map((candidate) => {
    candidate.totalScore =
      candidate.skills.score +
      candidate.experience.score +
      candidate.projects.score +
      candidate.education.score;

    // Round scores to 2 decimal places
    candidate.skills.score = Math.round(candidate.skills.score * 100) / 100;
    candidate.experience.score =
      Math.round(candidate.experience.score * 100) / 100;
    candidate.projects.score = Math.round(candidate.projects.score * 100) / 100;
    candidate.education.score =
      Math.round(candidate.education.score * 100) / 100;
    candidate.totalScore = Math.round(candidate.totalScore * 100) / 100;

    return candidate;
  });

  // Sort by total score in descending order
  return candidates.sort((a, b) => b.totalScore - a.totalScore);
}

function mapToResumeDTO(source: ResumeSource): any {
  return new ResumeDTO({
    filename: source.filename,
    originalName: source.originalName,
    fileLink: source.fileLink,
    industry: source.industry,
    skills: {
      technical: source.skills?.technical || [],
      soft: source.skills?.soft || [],
      languages: source.skills?.languages || [],
      tools: source.skills?.tools || [],
      other: source.skills?.other || [],
    },
    experience: source.experience?.map(exp => ({
      job_title: exp.job_title,
      company: exp.company,
      duration: exp.duration,
      description: exp.description || [],
      achievements: exp.achievements || [],
    })) || [],
    education: source.education?.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year,
      gpa: edu.gpa,
    })) || [],
    projects: source.projects?.map(project => ({
      title: project.title,
      description: project.description,
      technologies: project.technologies || [],
      url: project.url || null,
    })) || [],
    contact: {
      email: source.contact?.email || "",
      phone: source.contact?.phone || "",
      linkedin: source.contact?.linkedin || "",
      github: source.contact?.github || "",
      location: source.contact?.location || "",
    },
    certifications: source.certifications?.map(cert => ({
      title: cert.title,
      provider: cert.provider,
      date: cert.date,
      link: cert.link,
    })) || [],
    awards: source.awards || [],
    volunteer: source.volunteer || [],
    interests: source.interests || [],
    status: source.status || "completed"
  });
}

export {
  skillsToString,
  experienceToString,
  educationToString,
  projectsToString,
  aggregateResultsByCandidate,
  mapToResumeDTO,
  // Export types for use in other files
  type Skills,
  type Experience,
  type Education,
  type Project,
  type Contact,
  type Certification,
  type SearchResult,
  type AggregatedCandidate,
  type ResumeSource
};