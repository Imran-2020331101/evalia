import express from 'express';
import jobRoutes from './jobRoutes';
import compatibilityReviewRoutes from './compatibilityReviewRoutes';
// import overview from './overview';

const router = express.Router();


router.use("/jobs", jobRoutes);

router.use("/compatibility", compatibilityReviewRoutes);

export default router;
