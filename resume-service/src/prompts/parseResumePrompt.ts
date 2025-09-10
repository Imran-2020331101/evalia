// Type definitions for resume parsing
type IndustryType = 
  | "STEM & Technical"
  | "Business, Finance & Administration" 
  | "Creative, Media & Communication"
  | "Education, Social & Legal Services"
  | "Skilled Trades, Labor & Services"
  | "Others";

interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  tools: string[];
  other: string[];
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa: string;
}

interface Experience {
  job_title: string;
  company: string;
  duration: string;
  description: string[];
  achievements: string[];
}

interface Certification {
  title: string;
  provider: string;
  date: string;
  link: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  url: string;
}

interface Award {
  title: string;
  organization: string;
  year: string;
  description: string;
}

interface ParsedResumeResult {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  industry: IndustryType;
  skills: Skills;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  projects: Project[];
  languages: string[];
  awards: Award[];
  volunteer: string[];
  interests: string[];
  keywords: string[];
}

/**
 * Generate prompt for parsing resume text using AI
 * @param resumeText - The raw resume text to parse
 * @param industry - The target industry for keyword generation (optional)
 * @returns Formatted prompt string for AI processing
 */
const parseResumePrompt = (resumeText: string, industry: string = "General"): string => `You are an expert resume parser.

Given the following raw resume text, extract and return structured information in **VALID JSON** format only.

## JSON FORMAT:
Return the extracted data using **this exact JSON structure** (no deviation):

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string",
  "github": "string",
  "location": "string",
  "industry": "enum", // MUST be one of the following EXACT values:
  // [
  //   "STEM & Technical",
  //   "Business, Finance & Administration",
  //   "Creative, Media & Communication",
  //   "Education, Social & Legal Services",
  //   "Skilled Trades, Labor & Services",
  //   "Others"
  // ]
)
  "skills": {
    "technical": [ "string" ],
    "soft": [ "string" ],
    "languages": [ "string" ],
    "tools": [ "string" ],
    "other": [ "string" ]
  },
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string",
      "gpa": "string"
    }
  ],
  "experience": [
    {
      "job_title": "string",
      "company": "string",
      "duration": "string",
      "description": [ "string" ],
      "achievements": [ "string" ]
    }
  ],
  "certifications": [
    {
      "title": "string",
      "provider": "string",
      "date": "string",
      "link": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": [ "string" ],
      "url": "string"
    }
  ],
  "languages": [ "string" ],
  "awards": [
    {
      "title": "string",
      "organization": "string",
      "year": "string",
      "description": "string"
    }
  ],
  "volunteer": [ "string" ],
  "interests": [ "string" ],
  "keywords": [ "string" ]
}

## RULES:
- Use empty strings "" or empty arrays [] when information is missing.
- DO NOT change types. For example:
  - "interests" must always be a string array, never objects.
  - "certifications" must always be an array of objects (never just a string).
- Return ONLY the JSON object — no markdown, code blocks, or extra text.
- Strictly follow this schema to avoid breaking downstream parsers.
- Base the keywords on the industry: **${industry}**.
- Extract all information from the text below:

Resume Text:
"""
${resumeText}
"""`;

export default parseResumePrompt;
export { 
  IndustryType, 
  Skills, 
  Education, 
  Experience, 
  Certification, 
  Project, 
  Award, 
  ParsedResumeResult 
};