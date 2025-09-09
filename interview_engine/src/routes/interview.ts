import { Router } from 'express';
import { interviewController } from '../controllers/InterviewController';

const router = Router();

// route: /api/interview :

router.post('/',interviewController.scheduleInterview);
router.get('/user/:userId',interviewController.getAllInterviewsOfAUser);

router.patch('/:interviewId/transcript', interviewController.addTranscriptToInterview);
router.get('/:interviewId/summary', interviewController.getSummaryOfAnInterview);

export { router as interviewRouter };
