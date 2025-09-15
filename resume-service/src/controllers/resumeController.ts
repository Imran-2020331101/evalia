import axios from 'axios';
import { Request, Response } from 'express';
import resumeService, { ResumeAnalysis } from '../services/resumeService';
import logger from '../utils/logger';
import Resume, { IResume } from '../models/Resume';
import { 
  ExtractDetailsSchema,
  ResumeDTO,
  UploadResumeSchema,

} from '../types/resume.types';
import { mapToResumeDTO } from '../utils/resumeHelper';
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
import { openAIService ,EmbeddingResult, JobEmbeddingResult } from '../services/OpenAIService';
import { qdrantService } from '../services/QdrantService';
import { ExtractedResume, IExtractedResume } from '../models/ExtractedText';
import { JobDescriptionResult } from '../prompts/parseJobDescriptionprompt';
import { IJobDetailsDocument } from '../types/job.types';

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
      const analyzedResume : ResumeAnalysis = await resumeService.analyzeResume(extractedData.text);

     
      const extractedResume = new ResumeDTO(analyzedResume);
      extractedResume.fileLink = resumeURL;
      extractedResume.filename = `resume_${userId}`;
      extractedResume.contact.email = userEmail;
      extractedResume.uploadedBy = userEmail;
      
      logger.info("Resume DTO ", extractedResume);

      res.status(200).json({
        success : true,
        data    : extractedResume
      });
  })

  saveResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { resumeData , userId, userName, userEmail } :{
      resumeData : ResumeDTO , userId: string, userName: string, userEmail: string
    } = req.body;

    console.log("Recieved resume data : ",resumeData);
    resumeData.uploadedBy = userEmail;

    if (!resumeData) {
      throw new MissingRequiredFieldError('resumeData');
    }
    
    const savedResume = await resumeService.updateResume(resumeData, userId);
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
      await qdrantService.uploadResumeToQdrant(resumeEmbeddings,{
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
        userEmail: userEmail,
        userId: userId,
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

      const resume : IResume = await Resume.findById(resumeId).orFail();
      
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
    const { job_description} = req.body;
    const {k} = req.params;

    if (!job_description) {
      throw new MissingRequiredFieldError('job_description');
    }

      const requirements = await resumeService.extractDetailsFromJobDescription(
        job_description
      );

      console.log('job_description parsed ', requirements.industry);

      const matchedCandidates = await resumeService.globalResumeSearch(requirements, k);


      res.status(200).json({
        success: true,
        message: 'Vector search completed successfully',
        data: matchedCandidates,
      });
  })

  generateAutomatedShortlist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { jobId, k } = req.params;

    console.log('k : ', k);

    if (!jobId) {
      throw new MissingRequiredFieldError('jobId');
    }
    

      const response = await axios.get(`${process.env.JOB_SERVICE_URL}/api/jobs/${jobId}`);
      const job : IJobDetailsDocument = response.data.data;

      const candidates : string[] = job.applications.map((app)=> app.candidateId);
      

      const requirement: JobDescriptionResult = {
          industry: 'STEM & Technical',
          skills: 'Go, PostgreSQL, microservices architecture, REST API development, Redis, Docker, DevOps, unit testing, integration testing, Git, AWS, GCP, Azure, event-driven architecture, message queues, CI/CD, monitoring tools',
          experience: '5-7 years in backend development, 3 years hands-on with Go',
          projects: 'developing microservices infrastructure, optimizing RESTful APIs, implementing PostgreSQL solutions, maintaining caching strategies with Redis',
          education: "Bachelor's degree in Computer Science, Engineering, or related field"
        }
      // await resumeService.extractDetailsFromJobDescription(
      // [
      //   job.jobDescription,
      //   ...job.requirements.map((req) => req.description),
      //   ...job.responsibilities.map((res) => res.description),
      //     ...job.skills.map((skill) => skill.description),
      //   ].join(" ")
      // );



      
      const requirementEmbeddings : JobEmbeddingResult[] = await  openAIService.createJobEmbedding(requirement.skills, requirement.experience, requirement.projects, requirement.education);
      const searchResult = await qdrantService.filteredSearch(requirementEmbeddings,
        candidates,
        parseInt(k),
        process.env.QDRANT_COLLECTION_NAME);
        
      const matchedCandidates = resumeService.parseCandidateScores(searchResult);
      console.log("candidates after transforming : ", matchedCandidates);


      res.status(200).json({
        success: true,
        message: 'Vector search completed successfully',
        data: matchedCandidates,
      });
  })

  getResumePointById = asyncHandler(async(req: Request, res: Response)=> {

    const {candidateId} = req.params;
    const resumeEmbeddings = await qdrantService.getPointByResumeId(candidateId);

    res.status(200).json({
      success: true,
      data  : resumeEmbeddings
    })
  })

}

export default new ResumeController();
