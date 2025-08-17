import { Request, Response } from "express";
import { OverviewService } from "../services/overviewService";
import upskillBot from "../config/OpenRouter";
import { overviewPrompt } from "../prompts/overview";
import { z } from 'zod';
import { JobService } from "../services/jobService";
import {logger} from "../config/logger"; // no curly braces for default export


const overviewRequestSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
});

type OverviewRequest = z.infer<typeof overviewRequestSchema>

class OverviewControllerClass {
  getResumeOverview = async (req: Request, res: Response): Promise<void> => {
    console.log("OverviewController file loaded");
    try {
      // Validate input; throws on error and will be caught below
      const { resumeId, jobId } = overviewRequestSchema.parse(req.body);

      // 1) Fetch resume JSON from AI Server
      const resumeRaw = await OverviewService.loadResumeFromResumeServer(resumeId);

      // 2) Extract key parts and make a compact context
      const extracted = OverviewService.extractKeyParts(resumeRaw);
      const resumeContext = OverviewService.buildResumeContext(extracted);

      const jobResult = await JobService.findJobById(jobId);
      if (!jobResult.success) {
        const msg = jobResult.error || "Failed to fetch job";
        const status = msg === "Invalid job ID" ? 400 : msg === "Job not found" ? 404 : 500;
        res.json({
        success: false,
        data: "failed to create assessment",
      });
        return;
      }

      const job = (jobResult as any).data as any;
      const jobDescription: string = job?.jobDescription || "";

      const prompt = overviewPrompt(resumeContext, jobDescription);
      const aiResponse: string = await upskillBot(prompt);

      res.json({
        success: true,
        data: {
          resume: extracted,
          overview: aiResponse,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({ success: false, error: "Validation failed", details: errors });
        return;
      }
      logger.error("overviewController.getResumeOverview error", { error: err?.message, stack: err?.stack });
      res.status(500).json({ success: false, error: err?.message || "Failed to generate overview" });
    }
  }
}

export const OverviewController = new OverviewControllerClass();
 