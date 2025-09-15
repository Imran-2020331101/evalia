import { courseController } from "../controllers/courseController";
import { Router } from "express";

const router: Router = Router();

router.get('/suggestion/candidate/:candidateId',courseController.personalizedCourseSuggestion);

export default router;