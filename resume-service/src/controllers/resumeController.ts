import axios from 'axios';
import { Request, Response } from 'express';
import { z } from 'zod';
import resumeService from '../services/resumeService';
import logger from '../utils/logger';
import Resume, { IResume } from '../models/Resume';
import { 
  ExtractDetailsSchema,
  ResumeDTO,
  UploadResumeSchema,

} from '../types/resume.types';
import { mapToResumeDTO } from '../utils/resumeHelper';
import {
  addToVectordb,
  naturalLanguageSearch,
  advancedSearch,
  weightedSearch,
} from '../services/vectorDbService';
import { asyncHandler } from '../utils/asyncHandler';
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
import OpenAIService, { openAIService ,EmbeddingResult } from '../services/OpenAIService';
import { qdrantService } from '../services/QdrantService';
import { ExtractedResume, IExtractedResume } from '../models/ExtractedText';

// Additional request interfaces not yet in types file
interface AutomatedShortlistRequest extends Request {
  params: {
    jobId: string;
    k: string;
  };
}

class ResumeController {
  uploadResumeToCloud = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pdfFile = req.file;
    if (!pdfFile) {
      throw new MissingRequiredFieldError('file');
    }

    const { userEmail, userId } = UploadResumeSchema.parse(req.body);
    const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, '_');
    const folderName  = `${process.env.CLOUDINARY_FOLDER_NAME}`;
    
    try {
      const cloudinaryResult = await resumeService.uploadToCloudinary(
        pdfFile.buffer,
        folderName,
        cleanUserId
      );
      //asynchronously extracts the resume text
      resumeService.asynchronusTextProcesing(userId, userEmail, pdfFile.buffer);

      res.status(200).json({
        success: true,
        data: {
          downloadUrl : cloudinaryResult.url
        },
      });
    } catch (error: any) {
      throw new CloudinaryUploadError(error.message);
    }
  })

  extractDetailsFromResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    
    const { resumeURL, userEmail, userId } = ExtractDetailsSchema.parse(req.body);

      const extractedData : IExtractedResume  = await ExtractedResume.findOne({userId}).orFail();
      const analyzedResume = await resumeService.analyzeResume(extractedData.text);

      
      const extractedResume = new ResumeDTO(analyzedResume);
      extractedResume.fileLink = resumeURL;
      extractedResume.filename = `resume_${userId}`;
      extractedResume.contact.email = userEmail;
      extractedResume.uploadedBy = userEmail;
      
      logger.info("Resume DTO ", extractedResume);

      res.status(200).json({
        success : true,
        data    : extractedResume,
      });
  })

  saveResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { resumeData , userId, userName, userEmail } :{
      resumeData : ResumeDTO , userId: string, userName: string, userEmail: string
    } = req.body;

    resumeData.uploadedBy = userEmail;

    if (!resumeData) {
      throw new MissingRequiredFieldError('resumeData');
    }
    
    const savedResume = await resumeService.updateResume(resumeData);
    if(!savedResume) {
      throw new ResumeNotFoundError("Failed to save resume.");
    }

    logger.info('Resume Controller :: Resume saved to MongoDB', {
      resumeId: savedResume._id,
      filename: savedResume.filename,
      userEmail: savedResume.uploadedBy,
    });

    // Add or update in vector database for search
    
    try {
      const resumeEmbeddings = await openAIService.createResumeEmbeddings(savedResume);
      const qdrantUploadResult  = await qdrantService.uploadResumeToQdrant(resumeEmbeddings,{
        id: userId,
        name: userName,
        email: userEmail,
        industry: savedResume.industry || "Others",
        resumeId: savedResume._id?.toString() || userId,
      });

    } catch (error: any) {
      logger.error('Error processing resume vectors:', {
        error: error.message,
        resumeId: savedResume._id,
        userEmail: userId,
        stack: error.stack
      });
      throw new VectorDbError('insert', error.message);
    }

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: {
        id: savedResume._id,
        filename: savedResume.filename,
        status: savedResume.status,
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

  searchCandidatesUsingNLP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
