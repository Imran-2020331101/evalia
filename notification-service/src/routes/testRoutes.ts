import { Router } from 'express';
import { healthCheck, testError, validateExample } from '../controllers';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// Test error endpoint
router.get('/test-error', testError);

// Validation example
router.post('/validate', validateExample);

export default router;
