import express, { Request, Response } from 'express';

const router = express.Router();

// Simple job routes for testing
router.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Jobs endpoint working",
    data: []
  });
});

router.post("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Job creation endpoint",
    data: req.body
  });
});

router.get("/:jobId", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Job details for ${req.params.jobId}`,
    data: { jobId: req.params.jobId }
  });
});

router.get("/company/:companyName", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Jobs for company: ${req.params.companyName}`,
    data: []
  });
});

export default router;
