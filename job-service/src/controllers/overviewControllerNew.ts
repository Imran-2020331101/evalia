import { Request, Response } from "express";
import { z } from 'zod';
import { OverviewService } from "../services/overviewService";
import { JobService } from "../services/jobService";
import upskillBot from "../config/OpenRouter";
import { overviewPrompt } from "../prompts/overview";

const overviewRequestSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
});

type OverviewRequest = z.infer<typeof overviewRequestSchema>

class OverviewControllerClass {
  getResumeOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resumeId, jobId } = overviewRequestSchema.parse(req.body);

      const resumeRaw = await OverviewService.loadResumeFromResumeServer(resumeId);
      const extracted = OverviewService.extractKeyParts(resumeRaw);
      const resumeContext = OverviewService.buildResumeContext(extracted);

      const jobResult = await JobService.findJobById(jobId);

      if (!jobResult.success) {
        const msg = jobResult.error || "Failed to fetch job";
        const status = msg === "Invalid job ID" ? 400 : msg === "Job not found" ? 404 : 500;
        res.json({
        success: false,
        message: "Overview servcie failed",
        data: {  },
      });
        return;
      }

      const job = (jobResult as any).data as any;
      const jobDescription: string = job?.jobDescription || "";
      const prompt = overviewPrompt(resumeContext, jobDescription);
      const aiResponse: string = await upskillBot(prompt);
      

      
      res.json({
        success: true,
        message: "Overview endpoint is working",
        data: {
          resume: extracted,
          overview: aiResponse,
        }
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({ success: false, error: "Validation failed", details: errors });
        return;
      }
      res.status(500).json({ success: false, error: err?.message || "Failed to generate overview" });
    }
  }
}

export const OverviewController = new OverviewControllerClass();
