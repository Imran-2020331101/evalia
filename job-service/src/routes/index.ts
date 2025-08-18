import express from 'express';
import jobRoutes from './jobRoutes';
import overview from './overview';

const router = express.Router();


router.use("/jobs", jobRoutes);

router.use("/overview", overview);

export default router;
