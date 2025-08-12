import express, { Request, Response } from 'express';
import { jobController } from '../controllers/jobController';


const router = express.Router();

// Route handlers
router.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "Jobs endpoint working", data: [] });
});

router.post("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "Create job endpoint", data: {} });
});

// Comment out controller methods for now to test basic routing
// router.get("/", jobController.getAllJobs.bind(jobController));
// router.post("/", jobController.createJob.bind(jobController));
// router.get("/:jobId", jobController.getJobById.bind(jobController));
// router.put("/:jobId/status", jobController.updateJobStatus.bind(jobController));
// router.delete("/:jobId", jobController.deleteJob.bind(jobController));
// router.get("/company/:companyName", jobController.getJobsByCompany.bind(jobController));

export default router;
