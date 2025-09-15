import { courseController } from "../controllers/courseController";
import { Router } from "express";

const router: Router = Router();

// api/course

router.get('/suggestions',courseController.personalizedCourseSuggestion);
router.post('/candidate/:candidateId/save', courseController.saveCourse);
router.get('/candidate/:candidateId/saved/all', courseController.fetchSavedCourses);
router.delete('/candidate/:candidateId/delete/:videoId', courseController.removeCourseFromSavedList);

export default router;