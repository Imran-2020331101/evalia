import express from 'express';
import { OverviewController } from '../controllers/overviewController';

const router = express.Router();

// POST /api/overview
console.log("In routes file, OverviewController =", OverviewController);

router.post('/', OverviewController.getResumeOverview);

export default router;
