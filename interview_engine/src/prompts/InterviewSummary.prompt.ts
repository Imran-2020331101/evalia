import { TranscriptMessage } from "../types/evaluation.types";
import { IQuestionAnswer } from "../types/interview.types";

export function generateInterviewSummaryPrompt(transcript: TranscriptMessage[]): string {

  const qaJson = JSON.stringify(transcript, null, 2);

  return `
        You are an expert interviewer and evaluator. You are given an interview transcript in structured JSON format:

        ${qaJson}

        Each entry contains: question, candidateAnswer, optional referenceAnswer, score (0-10), feedback, duration, and answeredAt.

        Your task is to generate a comprehensive interview summary as a single, well-structured paragraph.

        Write a professional summary that covers:
        - Overall candidate performance and impression
        - Key strengths and areas for improvement observed
        - Notable responses and technical competency demonstrated
        - Communication skills and confidence level
        - Final recommendation on candidate suitability

        Write in a clear, professional tone as a single flowing text passage. Do not use bullet points, JSON, or markdown formatting. Keep it concise but informative (3-5 sentences).
        `.trim();
}
