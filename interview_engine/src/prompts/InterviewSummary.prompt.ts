import { TranscriptMessage } from "../types/evaluation.types";
import { IQuestionAnswer } from "../types/interview.types";

export function generateInterviewSummaryPrompt(transcript: TranscriptMessage[]): string {

  const qaJson = JSON.stringify(transcript, null, 2);

  return `
        You are an expert interviewer and evaluator. You are given an interview transcript in structured JSON format:

        ${qaJson}

        Each entry contains: question, candidateAnswer, optional referenceAnswer, score (0-10), feedback, duration, and answeredAt.

        Your task is to generate a summary of the interview with the following:

        1. Overall performance summary : Candidate's strengths, weaknesses, and general impression.
        2. Question-by-question breakdown : Compare the candidate's answer against the reference answer (if available), highlighting correctness, completeness, and clarity.
        3. Score insights : Mention average score, highest/lowest scoring questions, and patterns (e.g., strong in technical questions, weaker in behavioral ones).
        4. Final evaluation : A short paragraph summarizing if the candidate seems suitable for the role.

        Use a concise and professional tone.
        `.trim();
}
