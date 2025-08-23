import { z } from 'zod';
import { Request, Response } from 'express';
import { CompatibilityReviewModel } from '../models/CompatibilityReview';
import { logger } from '../config/logger';
import axios from 'axios';
import { ApplicationCompatibilityService } from '../services/ApplicationCompatibilityService';
import { JobService } from '../services/jobService';
import { ResumeDTO } from '../types/resume.types';

export class CompatibilityReviewController {
	/**
	 * Get compatibility review by ID
	 * @route GET /api/compatibility/:id
	 */
	async getCompatibilityById(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			if (!id) {
				res.status(400).json({ success: false, error: 'Review ID is required' });
				return;
			}
			const review = await CompatibilityReviewModel.findById(id);
			if (!review) {
				res.status(404).json({ success: false, error: 'Compatibility review not found' });
				return;
			}
			res.json({ success: true, data: review });
		} catch (error: any) {
			logger.error('Error fetching compatibility review', { error: error.message, id: req.params.id });
			res.status(500).json({ success: false, error: 'Internal server error while fetching compatibility review' });
		}
	}

  // POST /api/compatibility/create
  async createCompatibilityReview(req: Request, res: Response): Promise<void> {
	try {
		const validation = 
			z.object({
				jobId: z.string().min(1, 'Job ID is required'),
				candidateEmail: z.string().email('Valid candidate email is required'), }).safeParse(req.body);

		if (!validation.success) {
			const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
			res.status(400).json({ success: false, error: 'Validation failed', details: errors });
			return;
		}
		const { jobId, candidateEmail } = validation.data;

		console.log(`${process.env.RESUME_SERVICE_URL}`);
		const resumeResponse    = await axios.post(`${process.env.RESUME_SERVICE_URL}/api/resume/retrive`,{ email : candidateEmail });
		const resume: ResumeDTO = resumeResponse.data as ResumeDTO;
		const jobResult         = await JobService.findJobById(jobId);
		if(jobResult == null ) throw new Error("Job not found");
		const result            = await ApplicationCompatibilityService.evaluateCandidateProfile(jobResult, resume, candidateEmail);
      
      	res.status(200).json(result);
    } catch (error) {
			logger.error('Error creating compatibility review', { error: (error as Error).message });
			res.status(500).json({ success: false, error: 'Internal server error while creating compatibility review' });
		}
  }
}
