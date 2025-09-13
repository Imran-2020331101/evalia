export const questionGenerationPrompt = (
  jobDescription: string,
  responsibilities: any,
  requirements: any,
  skills: any
): string => `You are a helpful assistant. Based on the given job information, generate interview-style 10 questions and respond ONLY in valid JSON that matches this schema:

{
  "questions" : [
    "question": string, // Role-specific technical knowledge, tools, and problem-solving or Soft skills, teamwork, leadership, adaptability or Hypothetical scenarios relevant to responsibilities and challenges
    "referenceAnswer": string // A probable to the question that has the main points which should be present in the answer
  ]
}

JOB DESCRIPTION:
${jobDescription}

RESPONSIBILITIES:
${responsibilities}

REQUIREMENTS:
${requirements}

SKILLS:
${skills}

Instructions:
- Output must be strictly valid JSON with no extra text or formatting.
- Each array should contain at least 5 questions.
- Keep questions clear, concise, and specific to the provided details.
- Do not include explanations, just the questions themselves.`;

export default questionGenerationPrompt;
