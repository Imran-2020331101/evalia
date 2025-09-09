import express, { Request, Response } from 'express';
import { jobController } from '../controllers/jobController';
import { applicationController } from '../controllers/applicationController';


const router = express.Router();
// Tests
router.get('/test', applicationController.test.bind(applicationController));

// Organization-specific
router.get("/organization/:OrganizationId", jobController.getAllJobsOfAnOrganization.bind(jobController));
router.delete("/organization/:OrganizationId", jobController.deleteAllJobsOfAnOrganization.bind(jobController));

// User-related jobs
router.post("/user/applied", jobController.fetchBatchJobInfo.bind(jobController));
router.post("/user/saved", jobController.getAllJobsSavedByAUser.bind(jobController));

// Job creation & listing
router.get("/", jobController.getAllJobs.bind(jobController));
router.post("/", jobController.createJob.bind(jobController));

// --- IMPORTANT: static routes before dynamic ones ---
router.post("/generate/interview-questions", jobController.generateInterviewQuestions.bind(jobController));

// Job-specific (dynamic)
router.post("/:jobId/shortlist", applicationController.shortListCandidates.bind(applicationController));
router.get("/:jobId", jobController.getJobById.bind(jobController));
router.delete("/:jobId", jobController.deleteJob.bind(jobController));
router.put("/:jobId/status", jobController.updateJobStatus.bind(jobController));
router.get("/:jobId/interview-questions", jobController.getInterviewQuestionsOfAJob.bind(jobController));
router.get("/:jobId/description", jobController.getDescriptionOfAJob.bind(jobController));

// Applications
router.post("/apply", applicationController.applyToJob.bind(applicationController));
router.post("/:jobId/withdraw", applicationController.withDrawApplicationFromAJob.bind(applicationController));
router.post("/reject", applicationController.rejectRemainingCandidates.bind(applicationController));

export default router;
