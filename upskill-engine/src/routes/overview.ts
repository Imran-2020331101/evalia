import express from 'express';
import { OverviewController } from '../controllers/overviewController';

const router = express.Router();

// POST /api/overview
router.post('/', OverviewController.getResumeOverview.bind(OverviewController));

export default router;
