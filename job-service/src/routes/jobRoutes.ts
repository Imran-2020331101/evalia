import express, { Request, Response } from 'express';
import { jobController } from '../controllers/jobController';


const router = express.Router();

router.get("/organization/:OrganizationId", jobController.getAllJobsOfAnOrganization.bind(jobController));
router.delete("/organization/:OrganizationId", jobController.deleteAllJobsOfAnOrganization.bind(jobController));

router.post("/user/applied",jobController.getAllJobsAppliedByAUser.bind(jobController));
router.post("/user/saved",jobController.getAllJobsSavedByAUser.bind(jobController));

router.get("/", jobController.getAllJobs.bind(jobController));
router.post("/", jobController.createJob.bind(jobController));
router.get("/:jobId", jobController.getJobById.bind(jobController));
router.delete("/:jobId", jobController.deleteJob.bind(jobController));
router.put("/:jobId/status", jobController.updateJobStatus.bind(jobController));


router.post("/apply",jobController.applyToJob.bind(jobController));
router.post("/withdraw",jobController.withDrawApplicationFromAJob.bind(jobController));
router.post("/shortlist",jobController.shortListCandidate.bind(jobController));
router.post("/reject", jobController.rejectRemainingCandidates.bind(jobController));



export default router;
