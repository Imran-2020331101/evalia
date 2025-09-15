import { courseController } from "../controllers/courseController";
import { Router } from "express";

const router: Router = Router();

// api/course

router.get('/suggestions',courseController.personalizedCourseSuggestion);
router.post('/:videoId/candidate/:candidateId', courseController.saveCourse);

export default router;