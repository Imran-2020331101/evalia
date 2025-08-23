import express from 'express';
import { CompatibilityReviewController } from '../controllers/CompatibilityReviewController';

const router = express.Router();

const controller = new CompatibilityReviewController();

// GET /api/compatibility/:id
router.get('/:id', controller.getCompatibilityById.bind(controller));
router.post('/create', controller.createCompatibilityReview.bind(controller));

export default router;
