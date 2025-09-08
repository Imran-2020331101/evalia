import { Router } from 'express';
import { interviewController } from '../controllers/InterviewController';

const router = Router();

router.post('/',interviewController.scheduleInterview);
router.get('/user/:userId',interviewController.getAllInterviewOfAUser);

router.patch('/:interviewId/transcript', interviewController.addTranscriptToInterview);

export { router as interviewRouter };
