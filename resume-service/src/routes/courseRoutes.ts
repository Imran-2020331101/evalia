import { courseController } from "../controllers/courseController";
import { Router } from "express";

const router: Router = Router();

// api/course

router.get('/suggestions',courseController.personalizedCourseSuggestion);
router.post('/candidate/:candidateId/save', courseController.saveCourse);

export default router;