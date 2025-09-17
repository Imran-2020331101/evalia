import pdfParse from "pdf-parse";
import logger from "../utils/logger";
import openRouter from "../config/OpenRouter";
import streamifier from "streamifier";
import cloudinary from "../config/Cloudinary";
import parseResumePrompt from "../prompts/parseResumePrompt";
import parseJobDescriptionPrompt, { JobDescriptionResult } from "../prompts/parseJobDescriptionprompt";
import { ResumeData } from "../types/resume.types";
import Resume, { IResume } from "../models/Resume";
import { Metadata } from "../types/resume.types";
import { IndustryType, Skills, Education, Experience, 
  Certification, Project, Award } from "../types/resume.types";
import { asyncHandler } from "../middleware/errorHandler";
import { ExtractedResume } from "../models/ExtractedText";
import { Document } from "mongoose";
import { qdrantService, SearchResult } from "./QdrantService";
import { JobEmbeddingResult, openAIService } from "./OpenAIService";


// Type definitions
interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  [key: string]: any;
}


interface ExtractedText {
  text: string;
  metadata: Metadata;
}

export interface CandidateScore {
  'candidate-id': string;
  candidateName : any;
  skills: number | null;
  education: number | null;
  experience: number | null;
  projects: number | null;
}


// Type definitions for resume parsing

interface ParsedResumeResult {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  industry: IndustryType;
  skills: Skills;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  projects: Project[];
  languages: string[];
  awards: Award[];
  volunteer: string[];
  interests: string[];
  keywords: string[];
}

export interface ResumeAnalysis extends ParsedResumeResult {
  wordCount: number;
  characterCount: number;
  hasEmail: boolean;
  hasPhone: boolean;
}



class ResumeService {
  /**
   * Upload PDF buffer to Cloudinary
   * @param buffer - PDF file buffer
   * @param folderName - Cloudinary folder name
   * @param userId - User identifier for the file
   * @returns Promise<CloudinaryResult> - Upload result from Cloudinary
   */
  async uploadToCloudinary( buffer: Buffer,  folderName: string,  userId: string  ): Promise<CloudinaryResult> {
    return new Promise((resolve, reject) => {
      const publicId = `${userId}.pdf`;
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: folderName,
          public_id: publicId,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          invalidate: true,
          access_mode: "public",
        },
        async (error: any, result: any) => {
          if (result) {
            resolve(result as CloudinaryResult);
          } else {
            reject(error);
          }
        }
      );
      (streamifier.createReadStream(buffer) as any).pipe(stream);
    });
  }

  /**
   * Extract text from PDF buffer
   * @param pdfBuffer - PDF file buffer
   * @returns Promise<ExtractedText> - Extracted text and metadata
   */
  async extractText(pdfBuffer: Buffer): Promise<ExtractedText> {
    const result = await pdfParse(pdfBuffer);

    return {
      text: result.text,
      metadata: {
      pages: result.numpages,
      info: result.info,
      version: result.version,
    }};
  }

   async asynchronusTextProcesing( userId:string, userEmail:string, pdfBuffer: Buffer): Promise<void>{
    const extractedData = await this.extractText(pdfBuffer);
          const newExtrctedResume = new ExtractedResume({
            ...extractedData,
            userEmail: userEmail,
            userId: userId 
          });
          await newExtrctedResume.save();
          
          logger.info('Extracted resume data saved successfully in background:', {
            userEmail,
            userId,
            extractedDataKeys: Object.keys(extractedData)
          });
  }

  /**
   * Extract the key parts of the resume in key pair json format using LLM.
   * @param text - Extracted text from resume
   * @returns Promise<ResumeAnalysis> - Analyzed resume data from AI
   */
  async analyzeResume(text: string): Promise<ResumeAnalysis> {

      // Basic text metrics
      const basicMetrics  = {
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
          text
        ),
        hasPhone:
          /(\+?\d{1,4}[-.\s]?)?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/.test(
            text
          ),
      };

      const aiAnalysis = await this._parseResumeThroughAI(text);

      return {
        ...aiAnalysis,
        ...basicMetrics
      };

  }

  /**
   * Parse resume content through AI
   * @param content - Resume text content
   * @returns Promise<ParsedResuemResult> 
   */
  private async _parseResumeThroughAI(content: string): Promise<ParsedResumeResult> {
    const prompt = parseResumePrompt(content);

      const res = await openRouter(prompt);
      if (typeof res === "string") {
        const cleaned = res
          .replace(/^```json\s*/i, "") 
          .replace(/^```\s*/i, "") 
          .replace(/```$/, "") 
          .trim();

        return JSON.parse(cleaned);
      }

      return res as ParsedResumeResult;
  }



  async updateResume(resume : any, candidateId: string ): Promise<IResume> {
  
    // Ensure One resume per email
    const existingResume = await Resume.findOne({
      uploadedBy: resume.uploadedBy,
    });

    if (existingResume) {

      Object.assign(existingResume, resume);
      await qdrantService.deletePointsByUserId(candidateId);
      return await existingResume.save();
    } else {

      const newResume = new Resume(resume);
      return await newResume.save();

    }
  }

  /**
   * Extract details from job description using AI
   * @param jobDescription - Job description text
   * @returns Promise<JobDescriptionDetails> - Extracted job details
   */
  async extractDetailsFromJobDescription(
    jobDescription: string
  ): Promise<JobDescriptionResult> {
    const prompt = parseJobDescriptionPrompt(jobDescription);

      const res = await openRouter(prompt);

      const toParse = `${res}`;
      if (typeof toParse === "string") {
        const cleaned = res
          .replace(/^```json\s*/i, "") // Remove starting ```json
          .replace(/^```\s*/i, "") // Or just ``` if not tagged
          .replace(/```$/, "") // Remove ending ```
          .trim();

        return JSON.parse(cleaned) as JobDescriptionResult;
      }

      return res as unknown as JobDescriptionResult;

  }

  async globalResumeSearch(requirement : JobDescriptionResult, k : string) : Promise<CandidateScore[]>{
    
    const requirementEmbeddings : JobEmbeddingResult[] = await  openAIService.createJobEmbedding(requirement.skills, requirement.experience, requirement.projects, requirement.education);
    const searchResult = await qdrantService.globalSearch(requirementEmbeddings , parseInt(k), process.env.QDRANT_COLLECTION_NAME);
        
    const matchedCandidates = this.parseCandidateScores(searchResult);
    console.log("candidates after transforming : ", matchedCandidates);
    return matchedCandidates;
  }


  parseCandidateScores(data: SearchResult[]): CandidateScore[] {
    
    const candidatesMap = new Map<string, CandidateScore>();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const sectionData = data[key];
        const sectionName = sectionData.section;
        const points = sectionData.result.points;

        for (const point of points) {
          const candidateId = point.payload?.['candidate-id'];
          const score = point.score;

          // Skip if candidateId is not a string
          if (!candidateId || typeof candidateId !== 'string') continue;

          // If the candidate isn't in our map, add them with default null scores.
          if (!candidatesMap.has(candidateId)) {
            candidatesMap.set(candidateId, {
              'candidate-id': candidateId,
              candidateName: point.payload?.['candidate-name'],
              skills: null,
              education: null,
              experience: null,
              projects: null,
            });
          }

          // Get the candidate's score object from the map.
          const candidateScore = candidatesMap.get(candidateId)!;

          // Assign the score to the correct section, rounding to two decimal places.
          switch (sectionName) {
            case 'skills':
              candidateScore.skills = parseFloat(score.toFixed(2));
              break;
            case 'education':
              candidateScore.education = parseFloat(score.toFixed(2));
              break;
            case 'experience':
              candidateScore.experience = parseFloat(score.toFixed(2));
              break;
            case 'projects':
              candidateScore.projects = parseFloat(score.toFixed(2));
              break;
          }
        }
      }
    }

    return Array.from(candidatesMap.values());
  }




}

export default new ResumeService();