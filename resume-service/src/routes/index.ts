import express, { Router } from 'express';
import resumeRoutes from './resumeRoutes';

// Type definitions for API responses
interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
}

const router: Router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for service monitoring
 * @access  Public
 * @returns {HealthCheckResponse} Service status information
 */
router.get("/health", (req, res) => {
  const healthResponse: HealthCheckResponse = {
    success: true,
    message: "Evalia AI Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };
  
  res.status(200).json(healthResponse);
});

// Mount route modules
router.use("/resume", resumeRoutes);

export default router;