import axios from 'axios';
import { Request, Response } from 'express';
import { z } from 'zod';
import resumeService from '../services/resumeService';
import logger from '../utils/logger';
import cloudinary from '../config/Cloudinary';
import Resume, { IResume } from '../models/Resume';
import ResumeDTO from '../dto/resumeDTO';
import { mapToResumeDTO } from '../utils/resumeHelper';
import {
  addToVectordb,
  naturalLanguageSearch,
  advancedSearch,
  weightedSearch,
} from '../services/vectorDbService';

// Type definitions for request bodies
interface UploadResumeRequest extends Request {
  file?: Express.Multer.File;
  body: {
    userEmail: string;
    userId: string;
  };
}

interface ExtractDetailsRequest extends Request {
  body: {
    resumeURL: string;
    userEmail: string;
  };
}

interface SaveResumeRequest extends Request {
  body: {
    resumeData: any;
    userId: string;
    userName: string;
    userEmail: string;
  };
}

interface SearchCandidatesRequest extends Request {
  body: {
    job_description: string;
  };
}

interface AutomatedShortlistRequest extends Request {
  params: {
    jobId: string;
    k: string;
  };
}

class ResumeController {
  async uploadResumeToCloud(req: UploadResumeRequest, res: Response): Promise<void> {
    try {
      const pdfFile = req.file;
      if (!pdfFile) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const { userEmail, userId } = z
        .object({ userEmail: z.string(), userId: z.string() })
        .parse(req.body);

      const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, '_');

      const folderName = `${process.env.CLOUDINARY_FOLDER_NAME}`;
      const cloudinaryResult = await resumeService.uploadToCloudinary(
        pdfFile.buffer,
        folderName,
        cleanUserId
      );

      const downloadUrl = cloudinaryResult.url;
      res.status(200).json({
        success: true,
        data: {
          downloadUrl,
        },
      });
    } catch (error: any) {
      logger.error('Failed to upload resume to cloud : ', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload resume to cloud',
        details: error.message,
      });
    }
  }

  async extractDetailsFromResume(req: ExtractDetailsRequest, res: Response): Promise<void> {
    const { resumeURL, userEmail } = req.body;
    try {
      const fileResponse = await axios.get(resumeURL, {
        responseType: 'arraybuffer',
      });

      console.log('PDF downloaded successfully.');

      const pdfFile = Buffer.from(fileResponse.data, 'binary');
      const extractedData = await resumeService.extractText(pdfFile);
      const analysis = await resumeService.analyzeResume(extractedData.text);

      // Create ResumeDTO with analyzed data for frontend
      const extractedResume = new ResumeDTO({
        filename: 'Parsed Resume',
        originalName: (pdfFile as any).originalname,
        fileLink: resumeURL,
        industry: analysis.industry,
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        projects: analysis.projects,
        contact: {
          email: analysis.email,
          phone: analysis.phone,
          linkedin: analysis.linkedin,
          github: analysis.github,
          location: analysis.location,
        },
        certifications: analysis.certifications,
        awards: analysis.awards,
        volunteer: analysis.volunteer,
        interests: analysis.interests,
        status: 'completed',
      });

      const response = {
        success: true,
        data: {
          ...extractedResume.toObject(),
          // Include additional data needed for saving later
          metadata: extractedData.metadata,
          analysis: {
            wordCount: analysis.wordCount,
            characterCount: analysis.characterCount,
            hasEmail: analysis.hasEmail,
            hasPhone: analysis.hasPhone,
            sections: analysis.sections,
            keywords: analysis.keywords,
          },
          uploadedBy: userEmail,
          processedAt: new Date(),
        },
      };

      logger.info(
        'ResumeContoller :: line 127 :: Resume processing completed successfully'
      );

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Resume extraction failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to extract resume ',
        details: error.message,
      });
    }
  }

  async saveResume(req: SaveResumeRequest, res: Response): Promise<void> {
    try {
      const { resumeData, userId, userName, userEmail } = req.body;
      console.log(
        'Received parameters in job service ',
        userId,
        userName,
        resumeData.uploadedBy
      );

      if (!resumeData) {
        res.status(400).json({
          success: false,
          error: 'Resume data is required',
        });
        return;
      }

      // Check if user already has a resume (one resume per email)
      const existingResume = await Resume.findOne({
        uploadedBy: resumeData.uploadedBy,
      });
      let savedResume: IResume;

      if (existingResume) {
        // Update the existing resume with new data
        logger.info('Updating existing resume for user', {
          userEmail: resumeData.uploadedBy,
          existingResumeId: existingResume._id,
        });

        // Update all fields from resumeData
        Object.assign(existingResume, resumeData);
        savedResume = await existingResume.save();
      } else {
        // Create a new resume if one doesn't exist
        const newResume = new Resume(resumeData);
        savedResume = await newResume.save();
      }

      logger.info('Resume Controller :: Resume saved to MongoDB', {
        resumeId: savedResume._id,
        filename: savedResume.filename,
        userEmail: savedResume.uploadedBy,
        isUpdate: !!existingResume,
      });

      // Add or update in vector database for search
      const resumeDataForVector = {
        skills: savedResume.skills || {},
        education: savedResume.education || [],
        projects: savedResume.projects || [],
        experience: savedResume.experience || [],
        industry: savedResume.industry || 'Others',
      };
      
      const vectorResult = await addToVectordb(
        savedResume.uploadedBy,
        resumeDataForVector,
        userId,
        userName
      );

      res.status(200).json({
        success: true,
        message: existingResume
          ? 'Resume updated successfully'
          : 'Resume saved successfully',
        data: {
          id: savedResume._id,
          filename: savedResume.filename,
          originalName: savedResume.originalName,
          status: savedResume.status,
          isUpdate: !!existingResume,
        },
      });
    } catch (error: any) {
      logger.error('Failed to save resume:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save resume',
        details: error.message,
      });
    }
  }

  /**
   * Get specific resume by ID
   */
  async getResumeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(id);

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Resume ID is required',
        });
        return;
      }

      const resume = await Resume.findById(id);

      if (!resume) {
        res.status(404).json({
          success: false,
          error: 'Resume not found',
        });
        return;
      }

      const downloadUrl = resume.fileLink; // Assuming this is available in the resume object

      logger.info('Retrieved resume by ID', {
        resumeId: id,
        userEmail: resume.uploadedBy,
        downloadUrl,
      });
      console.log('fetched resume of the user', resume);
      res.status(200).json({
        success: true,
        data: {
          ...resume.toObject(),
          downloadUrl: downloadUrl,
        },
      });
    } catch (error: any) {
      logger.error('Failed to retrieve resume by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve resume',
        details: error.message,
      });
    }
  }

  /**
   * Get resume by email address
   */
  async getResumeByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;

      console.log(email);

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Email address is required',
        });
        return;
      }

      const resume = await Resume.findOne({ uploadedBy: email });

      if (!resume) {
        res.status(404).json({
          success: false,
          error: 'Resume not found for this email',
        });
        return;
      }

      logger.info('Retrieved resume by email', {
        email: email,
        resumeId: resume._id,
        downloadUrl: resume.fileLink,
      });

      const resumeDTO = mapToResumeDTO(resume.toObject() as any);

      const { isValid, errors } = resumeDTO.validate();
      if (!isValid) {
        console.error('Validation errors:', errors);
      }

      res.status(200).json({
        success: true,
        data: {
          ...resumeDTO.toObject(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to retrieve resume by email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve resume',
        details: error.message,
      });
    }
  }

  /**
   * Download resume PDF file
   */
  async downloadResume(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Resume ID is required',
        });
        return;
      }

      const resume = await Resume.findById(id);

      if (!resume) {
        res.status(404).json({
          success: false,
          error: 'Resume not found',
        });
        return;
      }

      // Generate download URL with proper PDF headers
      const downloadUrl = cloudinary.url(resume.filename, {
        resource_type: 'raw',
        flags: 'attachment',
        format: 'pdf',
      });

      // Set proper headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${resume.originalName}"`
      );

      // Redirect to Cloudinary download URL
      res.redirect(downloadUrl);

      logger.info('Resume download initiated', {
        resumeId: id,
        filename: resume.originalName,
        userEmail: resume.uploadedBy,
      });
    } catch (error: any) {
      logger.error('Failed to download resume:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download resume',
        details: error.message,
      });
    }
  }

  /**
   * Get upload status/health check
   */
  async getUploadStatus(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Resume upload service is running',
        timestamp: new Date().toISOString(),
        service: 'evalia-ai-server',
      });
    } catch (error: any) {
      logger.error('Status check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Service status check failed',
      });
    }
  }

  async searchCandidatesUsingNLP(req: SearchCandidatesRequest, res: Response): Promise<void> {
    try {
      const { job_description } = req.body;

      if (!job_description) {
        res.status(400).json({
          success: false,
          error: 'Job description is required',
        });
        return;
      }

      const requirement = await resumeService.extractDetailsFromJobDescription(
        job_description
      );

      console.log('job_description parsed ', requirement.industry);

      const Candidates = await naturalLanguageSearch(requirement, 10);

      console.log('Candidates from search:', Candidates);
      console.log('Is Candidates an array?', Array.isArray(Candidates));

      res.status(200).json({
        success: true,
        message: 'Vector search completed successfully',
        data: Candidates,
      });
    } catch (error: any) {
      logger.error('Basic search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform basic search',
        details: error.message,
      });
    }
  }

  async generateAutomatedShortlist(req: AutomatedShortlistRequest, res: Response): Promise<void> {
    try {
      const { jobId, k } = req.params;

      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job description is required',
        });
        return;
      }

      const response = await axios.get(`${process.env.JOB_SERVICE_URL}/api/jobs/${jobId}`);
      const job = response.data.data;

      const requirement = await resumeService.extractDetailsFromJobDescription(
        job.jobDescription + job.requirements.description + job.responsibilities.description + job.skills.description
      );

      const Candidates = await naturalLanguageSearch(requirement, parseInt(k) || 10);
      const appliedCandidates = job.applications.map((application: any) => application.candidateId);

      const matchedCandidates = Candidates.filter((c: any) => appliedCandidates.includes(c.id));
      console.log('finalized Candidate List ', matchedCandidates);

      res.status(200).json({
        success: true,
        message: 'Vector search completed successfully',
        data: matchedCandidates,
      });
    } catch (error: any) {
      logger.error('Automated shortlist generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate automated shortlist',
        details: error.message,
      });
    }
  }
}

export default new ResumeController();
