import pdfParse from "pdf-parse";
import logger from "../utils/logger";
const openRouter = require("../config/OpenRouter");
const streamifier = require("streamifier");
const cloudinary = require("../config/Cloudinary");
const parseResumePrompt = require("../prompts/parseResumePrompt");
const parseJobDescriptionPrompt = require("../prompts/parseJobDescriptionPrompt");

// Type definitions
interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  [key: string]: any;
}

interface PDFMetadata {
  pages: number;
  info: any;
  version: string | null;
}

interface ExtractedText {
  text: string;
  metadata: PDFMetadata;
}

interface BasicMetrics {
  wordCount: number;
  characterCount: number;
  hasEmail: boolean;
  hasPhone: boolean;
}

interface AIAnalysisResult {
  [key: string]: any;
}

interface ResumeAnalysis extends BasicMetrics {
  [key: string]: any;
}

interface JobDescriptionDetails {
  [key: string]: any;
}

class ResumeService {
  /**
   * Upload PDF buffer to Cloudinary
   * @param buffer - PDF file buffer
   * @param folderName - Cloudinary folder name
   * @param userId - User identifier for the file
   * @returns Promise<CloudinaryResult> - Upload result from Cloudinary
   */
  async uploadToCloudinary(
    buffer: Buffer,
    folderName: string,
    userId: string
  ): Promise<CloudinaryResult> {
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
    try {
      logger.info("Starting PDF text extraction");

      const result = await pdfParse(pdfBuffer);

      logger.info("PDF text extraction completed", {
        pages: result.numpages,
        textLength: result.text.length,
      });

      return {
        text: result.text,
        metadata: {
          pages: result.numpages,
          info: result.info,
          version: result.version,
        },
      };
    } catch (error) {
      logger.error("PDF text extraction failed:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }

  /**
   * Extract the key parts of the resume in key pair json format using LLM.
   * @param text - Extracted text from resume
   * @returns Promise<ResumeAnalysis> - Analyzed resume data from AI
   */
  async analyzeResume(text: string): Promise<ResumeAnalysis> {
    try {
      logger.info("Starting AI-based resume analysis");

      // Basic text metrics
      const basicMetrics: BasicMetrics = {
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

      const analysis: ResumeAnalysis = {
        ...basicMetrics,
        ...aiAnalysis,
      };

      logger.info("AI resume analysis completed", {
        wordCount: analysis.wordCount,
        hasStructuredData: !!aiAnalysis,
      });

      return analysis;
    } catch (error) {
      logger.error("Resume analysis failed:", error);
      throw new Error("Failed to analyze resume content");
    }
  }

  /**
   * Parse resume content through AI
   * @param content - Resume text content
   * @returns Promise<AIAnalysisResult> - AI analysis result
   * @private
   */
  private async _parseResumeThroughAI(content: string): Promise<AIAnalysisResult> {
    const prompt = parseResumePrompt(content);

    try {
      const res = await openRouter(prompt);

      console.log(res);

      if (typeof res === "string") {
        const cleaned = res
          .replace(/^```json\s*/i, "") // Remove starting ```json
          .replace(/^```\s*/i, "") // Or just ``` if not tagged
          .replace(/```$/, "") // Remove ending ```
          .trim();

        return JSON.parse(cleaned);
      }

      logger.info(
        "resume service :: line 163 :: Successfully cleaned response :" + res
      );

      return res as AIAnalysisResult;
    } catch (error) {
      logger.error("AI resume parsing failed:", error);
      throw new Error("Failed to parse resume through AI");
    }
  }

  /**
   * Extract details from job description using AI
   * @param jobDescription - Job description text
   * @returns Promise<JobDescriptionDetails> - Extracted job details
   * @private
   */
  private async _extractDetailsFromJobDescription(
    jobDescription: string
  ): Promise<JobDescriptionDetails> {
    const prompt = parseJobDescriptionPrompt(jobDescription);

    try {
      logger.info("Starting job description parse....");
      const res = await openRouter(prompt);

      const toParse = `${res}`;
      if (typeof toParse === "string") {
        const cleaned = res
          .replace(/^```json\s*/i, "") // Remove starting ```json
          .replace(/^```\s*/i, "") // Or just ``` if not tagged
          .replace(/```$/, "") // Remove ending ```
          .trim();

        console.log("extracted job description ", cleaned);
        return JSON.parse(cleaned);
      }

      return res as JobDescriptionDetails;
    } catch (error) {
      logger.error("Job description Failed", error);
      throw new Error("Failed to parse job description through AI");
    }
  }
}

export default new ResumeService();