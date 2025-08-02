const pdfParse = require("pdf-parse");
const logger = require("../utils/logger");
const openRouter = require("../config/OpenRouter");
const streamifier = require("streamifier");
const cloudinary = require("../config/Cloudinary");
const parseResumePrompt = require("../prompts/parseResumePrompt");
const parseJobDescriptionPrompt = require("../prompts/parseJobDescriptionPrompt");

class ResumeService {
  async uploadToCloudinary(buffer, originalName, folderName) {
    return new Promise((resolve, reject) => {
      // Clean filename - remove extension and special characters
      const cleanName = originalName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]/g, "_");
      const publicId = `${Date.now()}_${cleanName}`;

      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: folderName,
          public_id: publicId,
          use_filename: false,
          unique_filename: false,
          overwrite: true,
          invalidate: true,
          // Don't set format - let Cloudinary detect PDF
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  /**
   * Extract text from PDF buffer
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async extractText(pdfBuffer) {
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
   * Analyze resume content using AI parsing
   * @param {string} text - Extracted text from resume
   * @returns {Promise<Object>} - Analyzed resume data from AI
   */
  async analyzeResume(text) {
    try {
      logger.info("Starting AI-based resume analysis");

      // Basic text metrics
      const basicMetrics = {
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

      const analysis = {
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

  async _parseResumeThroughAI(content) {
    const prompt = parseResumePrompt(content);

    try {
      const res = await openRouter(prompt);

      if (typeof res === "string") {
        const cleaned = res
          .replace(/^```json\s*/i, "") // Remove starting ```json
          .replace(/^```\s*/i, "") // Or just ``` if not tagged
          .replace(/```$/, "") // Remove ending ```
          .trim();

        return JSON.parse(cleaned);
      }

      logger.success(
        "resume service :: line 163 :: Successfully cleaned response :" + res
      );

      return res;
    } catch (error) {
      logger.error("AI resume parsing failed:", error);
      throw new Error("Failed to parse resume through AI");
    }
  }

  async _extractDetailsFromJobDescription(jobDescription) {
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

          console.log("extracted job description ",cleaned);
        return JSON.parse(cleaned);
      }


      return res;
    } catch (error) {
      logger.error("Job description Failed", error);
      throw new Error("Failed to parse job description through AI");
    }
  }
}

module.exports = new ResumeService();
