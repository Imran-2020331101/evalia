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
import { asyncHandler } from '../utils/asyncHandler';
import { UpdateResult } from 'mongoose';
import {
  BadRequestError,
  NotFoundError,
  ResumeNotFoundError,
  MissingRequiredFieldError,
  CloudinaryUploadError,
  PDFParsingError,
  ResumeAnalysisError,
  VectorDbError,
  CandidateSearchError,
  ShortlistGenerationError,
} from '../errors';

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
  uploadResumeToCloud = asyncHandler(async (req: UploadResumeRequest, res: Response): Promise<void> => {
    const pdfFile = req.file;
    if (!pdfFile) {
      throw new MissingRequiredFieldError('file');
    }

    const { userEmail, userId } = z
      .object({ userEmail: z.string(), userId: z.string() })
      .parse(req.body);

    const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, '_');

    const folderName = `${process.env.CLOUDINARY_FOLDER_NAME}`;
    
    try {
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
      throw new CloudinaryUploadError(error.message);
    }
  })

  extractDetailsFromResume = asyncHandler(async (req: ExtractDetailsRequest, res: Response): Promise<void> => {
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
      if (error.message.includes('extract')) {
        throw new PDFParsingError(error.message);
      } else if (error.message.includes('analyze')) {
        throw new ResumeAnalysisError(error.message);
      }
      throw error;
    }
  })

  saveResume = asyncHandler(async (req: SaveResumeRequest, res: Response): Promise<void> => {
    const { resumeData, userId, userName, userEmail } = req.body;
    console.log(
      'Received parameters in job service ',
      userId,
      userName,
      resumeData.uploadedBy
    );

    if (!resumeData) {
      throw new MissingRequiredFieldError('resumeData');
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
    
    try {
      const vectorResult = await addToVectordb(
        savedResume.uploadedBy,
        resumeDataForVector,
        userId,
        userName
      );
    } catch (error: any) {
      throw new VectorDbError('insert', error.message);
    }

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
  })

  /**
   * Get specific resume by ID
   */
  getResumeById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const { resumeId } = req.params;
      console.log(resumeId);

      if (!resumeId) {
        throw new MissingRequiredFieldError('resumeId');
      }

      const resume = await Resume.findById(resumeId);
      
      if (!resume) {
        throw new ResumeNotFoundError(resumeId);
      }

      const downloadUrl = resume.fileLink; 

      res.status(200).json({
        success: true,
        data: {
          ...resume.toObject(),
          downloadUrl: downloadUrl,
        },
      });

  })

  /**
   * Get resume by email address
   */
  getResumeByEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      throw new MissingRequiredFieldError('email');
    }

    const resume = await Resume.findOne({ uploadedBy: email });
    
    if (!resume) {
      throw new ResumeNotFoundError(`email: ${email}`);
    }
    
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
  })

  /**
   * Get upload status/health check
   */
  getUploadStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Resume upload service is running',
      timestamp: new Date().toISOString(),
      service: 'evalia-ai-server',
    });
  })

  searchCandidatesUsingNLP = asyncHandler(async (req: SearchCandidatesRequest, res: Response): Promise<void> => {
    const { job_description } = req.body;

    if (!job_description) {
      throw new MissingRequiredFieldError('job_description');
    }

    try {
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
      throw new CandidateSearchError('NLP search', error.message);
    }
  })

  generateAutomatedShortlist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { jobId, k } = req.params;

    if (!jobId) {
      throw new MissingRequiredFieldError('jobId');
    }

    try {
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
      throw new ShortlistGenerationError(jobId, error.message);
    }
  })

}

export default new ResumeController();
