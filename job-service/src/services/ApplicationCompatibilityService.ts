import logger from "../config/logger";
import { ResumeDTO } from "@/types/resume.types";
import { overviewPrompt } from "../prompts/EvaluationPrompt";
import upskillBot from "../config/OpenRouter";
import { CompatibilityReviewModel } from "../models/CompatibilityReview";
import { IJobDetailsDocument } from "../models/JobDetails";

class applicationCompatibilityService {

  async evaluateCandidateProfile(job: IJobDetailsDocument, resume: ResumeDTO, email: string) {
    try {

      const prompt = overviewPrompt(JSON.stringify(resume), JSON.stringify(job));
      const evaluation = await upskillBot(prompt);

      let cleaned = typeof evaluation === "string"
        ? evaluation
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/, "")
            .trim()
        : evaluation;

      let parsed = JSON.parse(cleaned);

      logger.info("Candidate evaluation result", { job, evaluation: parsed });

      const reviewDoc = new CompatibilityReviewModel({
        jobId: job._id || "",
        candidateEmail: email || "",
        matchPercentage: parsed.matchPercentage,
        fit: parsed.fit,
        strengths: parsed.strength,
        weaknesses: parsed.weakness,
      });
      const res = await reviewDoc.save();

      return res;
    } catch (err: any) {
      logger.error("Error during candidate evaluation", { error: err.message });
      return;
    }
  }

  async findCompatibilityReview(jobId: string, candidateEmail: string) {
    try {
      const review = await CompatibilityReviewModel.findOne({
        jobId: jobId,
        candidateEmail: candidateEmail
      });

      if (!review) {
        logger.info("No compatibility review found", { jobId, candidateEmail });
        return null;
      }

      logger.info("Compatibility review found", { jobId, candidateEmail, reviewId: review._id });
      return review;
    } catch (err: any) {
      logger.error("Error finding compatibility review", { error: err.message, jobId, candidateEmail });
      return null;
    }
  }

}

export const ApplicationCompatibilityService = new applicationCompatibilityService();