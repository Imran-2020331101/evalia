import express, { Request, Response } from 'express';
import { jobController } from '../controllers/jobController';
import { applicationController } from '../controllers/applicationController';


const router = express.Router();

router.get('/test',applicationController.test.bind(applicationController));

router.get("/organization/:OrganizationId", jobController.getAllJobsOfAnOrganization.bind(jobController));
router.delete("/organization/:OrganizationId", jobController.deleteAllJobsOfAnOrganization.bind(jobController));

router.post("/user/applied",jobController.fetchBatchJobInfo.bind(jobController));
router.post("/user/saved",jobController.getAllJobsSavedByAUser.bind(jobController));

router.get("/", jobController.getAllJobs.bind(jobController));
router.post("/", jobController.createJob.bind(jobController));
router.get("/:jobId", jobController.getJobById.bind(jobController));
router.delete("/:jobId", jobController.deleteJob.bind(jobController));
router.put("/:jobId/status", jobController.updateJobStatus.bind(jobController));

router.get("/:jobId/interview-questions",jobController.getInterviewQuestionsOfAJob.bind(jobController));
router.get("/:jobId/description",jobController.getDescriptionOfAJob.bind(jobController));
router.post("/generate/interview-questions", jobController.generateInterviewQuestions.bind(jobController));

// router.use("/:jobId/application", aplicationRouter);
// router.post("/:jobId/application/user/:userId",jobController.applyToJob.bind(jobController));
// router.delete("/:jobId/application/user/:userId",jobController.withDrawApplicationFromAJob.bind(jobController));


router.post("/apply",applicationController.applyToJob.bind(applicationController));
router.post("/:jobId/withdraw",applicationController.withDrawApplicationFromAJob.bind(applicationController));
router.post("/:jobId/shortlist",applicationController.shortListCandidates.bind(applicationController));
router.post("/reject", applicationController.rejectRemainingCandidates.bind(applicationController));





export default router;
