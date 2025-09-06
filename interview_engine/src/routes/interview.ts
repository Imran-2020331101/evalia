import { Router } from 'express';
import { interviewController } from '../controllers/InterviewController';

const router = Router();

router.post('/', async (req, res) => {
  await interviewController.scheduleInterview(req, res);
});

router.patch('/:interviewId/transcript', async (req, res) => {
  await interviewController.addTranscriptToInterview(req, res);
});

export { router as interviewRouter };
