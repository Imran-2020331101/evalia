import express, { Request, Response } from 'express';
import jobRoutes from './jobRoutes';
import overview from './overview';

const router = express.Router();

// Use routes
router.use("/jobs", jobRoutes);

router.use("/overview", overview);

// Health check route
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Upskill Engine API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
