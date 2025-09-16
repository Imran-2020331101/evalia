import { Router } from 'express';
import { interviewController } from '../controllers/InterviewController';

const router = Router();

// route: /api/interview :

router.post('/',interviewController.scheduleInterview);
router.get('/user/:candidateId',interviewController.getAllInterviewsOfAUser);

router.get('/:interviewId',interviewController.getInterviewDetails);
router.get('/job/:jobId/candidate/:candidateId', interviewController.getInterviewByJobAndCandidate);
router.put('/:interviewId/transcript', interviewController.addTranscriptToInterview);
router.get('/:interviewId/summary', interviewController.getSummaryOfAnInterview);

router.get('/:interviewId/evaluation', interviewController.getEvaluationByInterviewId);

export { router as interviewRouter };
