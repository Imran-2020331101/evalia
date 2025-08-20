export const overviewPrompt = (
  resumeContext: string,
  jobDescription: string
): string => `You are a helpful assistant. Compare the following resume to the job description and respond ONLY in valid JSON that matches this schema:

{
  "matchPercentage": number, // Overall fit score between 0 and 100
  "fit": "Best Fit" | "Good Fit" | "Average" | "Bad Fit",
  "strength": string[], // Short, clear sentences highlighting top strengths and matches
  "weakness": string[]  // Short, clear sentences describing key gaps or weaknesses
}

RESUME:
${resumeContext}

JOB DESCRIPTION:
${jobDescription}

Instructions:
- Output must be strictly valid JSON with no extra text or formatting.
- matchPercentage must be an integer (no decimals).
- Strength and weakness arrays should contain concise, sentence-like insights (max 15 words each).`;



export default overviewPrompt;
