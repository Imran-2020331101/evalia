import { ExtractedResume } from "../types/overview.types";
import logger from "../config/logger";
import axios from 'axios'
import { ResumeDTO } from "@/types/resume.types";

class overviewService {

  async evaluateCandidateProfile(jobDescription: string, resume: ResumeDTO) {
    try {
      // Import prompt and OpenRouter client
      const { overviewPrompt } = await import("../prompts/EvaluationPrompt");
      const upskillBot = (await import("../config/OpenRouter")).default;

      // Prepare prompt using resume and job description
      const prompt = overviewPrompt(JSON.stringify(resume), jobDescription);

      // Get evaluation from OpenRouter
      const evaluation = await upskillBot(prompt);

      // Try to parse the JSON response
      let parsed;
      try {
        parsed = JSON.parse(evaluation);
      } catch (err) {
        logger.error("Failed to parse evaluation JSON", { evaluation });
        return;
      }

      // Log or store the evaluation result (replace with DB save if needed)
      logger.info("Candidate evaluation result", { jobDescription, evaluation: parsed });
      // TODO: Save parsed evaluation to DB if required
      return parsed;
    } catch (err: any) {
      logger.error("Error during candidate evaluation", { error: err.message });
      return;
    }
  }

}

export const OverviewService = new overviewService();