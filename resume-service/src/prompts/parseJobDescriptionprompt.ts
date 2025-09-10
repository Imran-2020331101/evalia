// Type definitions for job description parsing
type IndustryType = 
  | "STEM & Technical"
  | "Business, Finance & Administration" 
  | "Creative, Media & Communication"
  | "Education, Social & Legal Services"
  | "Skilled Trades, Labor & Services"
  | "Others";

interface JobDescriptionResult {
  industry: IndustryType;
  skills: string;
  experience: string;
  projects: string;
  education: string;
}

/**
 * Generate prompt for parsing job description using AI
 * @param jobDescription - The job description text to parse
 * @returns Formatted prompt string for AI processing
 */
const parseJobDescriptionPrompt = (jobDescription: string): string => `
Extract the key job requirements from the following job description and return a JSON object with these fields:
- industry
- skills
- experience
- projects
- education

Only include relevant and concise strings per field that can be used for similarity search in a vector database. 
Use a single string per field (comma-separated if needed). If any field is not clearly mentioned, infer it or leave it as an empty string.
except "industry" you must return one of the given value for "industry".

Job Description:
""" 
${jobDescription}
"""

Return only the JSON object in this format:
{
  "industry": "enum", // MUST be one of the following EXACT values:
  // [
  //   "STEM & Technical",
  //   "Business, Finance & Administration",
  //   "Creative, Media & Communication",
  //   "Education, Social & Legal Services",
  //   "Skilled Trades, Labor & Services",
  //   "Others"
  // ]
  "skills": "",
  "experience": "",
  "projects": "",
  "education": ""
}
`;

export default parseJobDescriptionPrompt;
export { IndustryType, JobDescriptionResult };