import { z } from 'zod';
import { Request, Response } from 'express';
import { CompatibilityReviewModel } from '../models/CompatibilityReview';
import { logger } from '../config/logger';
import axios from 'axios';
import { ApplicationCompatibilityService } from '../services/ApplicationCompatibilityService';
import { JobService } from '../services/jobService';
import { ResumeDTO } from '../types/resume.types';
import { asyncHandler } from '../utils/asyncHandler';

export class CompatibilityReviewController {
	/**
	 * Get compatibility review by ID
	 * @route GET /api/compatibility/:id
	 */
	getCompatibilityById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const { reviewId } = req.params;
		console.log(reviewId);
		if (!reviewId) {
			res.status(400).json({ success: false, error: 'Review ID is required' });
			return;
		}
		const review = await CompatibilityReviewModel.findById(reviewId);
		if (!review) {
			res.status(404).json({ success: false, error: 'Compatibility review not found' });
			return;
		}
		res.json({ success: true, data: review });
	});

  	// POST /api/compatibility/create
	createCompatibilityReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
		const validation = 
			z.object({
				jobId: z.string().min(1, 'Job ID is required'),
				candidateEmail: z.string().email('Valid candidate email is required'), 
			}).safeParse(req.body);

		if (!validation.success) {
			const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			res.status(400).json({ success: false, error: 'Validation failed', details: errors });
			return;
		}
		const { jobId, candidateEmail } = validation.data;

		console.log(`${process.env.RESUME_SERVICE_URL}`);
		const resumeResponse    = await axios.get(`${process.env.RESUME_SERVICE_URL}/api/resume/retrieve?email=${candidateEmail}`);
		const resume: ResumeDTO = resumeResponse.data as ResumeDTO;
		const jobResult         = await JobService.findJobById(jobId);
		if(jobResult == null ) throw new Error("Job not found");
		const result            = await ApplicationCompatibilityService.evaluateCandidateProfile(jobResult, resume, candidateEmail);
	
		res.status(200).json(result);
	});
}
