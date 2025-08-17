import express, { Request, Response } from 'express';
import { jobController } from '../controllers/jobController';


const router = express.Router();

router.get("/", jobController.getAllJobs.bind(jobController));
router.post("/", jobController.createJob.bind(jobController));
router.get("/:jobId", jobController.getJobById.bind(jobController));
router.put("/:jobId/status", jobController.updateJobStatus.bind(jobController));
router.delete("/:jobId", jobController.deleteJob.bind(jobController));
router.get("/company/:companyName", jobController.getJobsByCompany.bind(jobController));


router.post("/apply",jobController.applyToJob.bind(jobController));
router.post("/shortlist",jobController.shortListCandidate.bind(jobController));



export default router;
