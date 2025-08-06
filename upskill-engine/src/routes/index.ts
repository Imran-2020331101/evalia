import express, { Request, Response } from 'express';
import jobRoutes from './jobRoutes';

const router = express.Router();

// Use routes
router.use("/jobs", jobRoutes);

// Health check route
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Upskill Engine API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
