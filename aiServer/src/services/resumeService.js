const pdfParse = require("pdf-parse");
const logger = require("../utils/logger");
const openRouter = require("../config/OpenRouter");
const streamifier = require("streamifier");
const cloudinary = require("../config/Cloudinary");

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

      // Get AI analysis
      const aiAnalysis = await this._parseResumeThroughAI(text);

      // Combine basic metrics with AI results
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
    const prompt = `Given the following raw resume text, extract and return the structured information in **valid JSON** format.
    
    Required JSON keys:
    - "name": candidate's full name
    - "email": email address
    - "phone": phone number
    - "linkedin": LinkedIn profile URL
    - "github": GitHub profile URL (if available)
    - "location": address or location (if available)
    - "skills": array of technical and soft skills
    - "education": array of education entries with {"degree", "institution", "year", "gpa"} (if available)
    - "experience": array of work experience entries with {"job_title", "company", "duration", "location", "description", "achievements"}(if available)
    - "certifications": array of certifications (if available)
    - "projects": array of projects with {"title", "description", "technologies", "url"} (if available)
    - "languages": array of spoken languages (if mentioned)
    - "awards": array of awards and honors (if available)
    - "volunteer": array of volunteer experience (if available)
    - "interests": array of hobbies and interests (if available)
    
    Important instructions:
    1. Extract ALL information present in the resume
    2. If any section is missing, return an empty array [] or empty string ""
    3. For experience, include bullet points as achievements array
    4. For skills, categorize into technical and soft skills if possible
    5. Extract dates in a consistent format
    6. Return ONLY valid JSON, no additional text or formatting
    
    Resume Text:
    """
    ${content}
    """`;

    try {
      const res = await openRouter(prompt);

      const aiContent = res.content || res;

      if (typeof aiContent === "string") {
        // Clean the response to extract JSON if it's wrapped in markdown or other text
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        // If no JSON found, try parsing the entire content
        try {
          return JSON.parse(aiContent.trim());
        } catch (parseError) {
          logger.warn(
            "Could not parse AI response as JSON, returning raw content"
          );
          return { error: "Failed to parse JSON", rawResponse: aiContent };
        }
      }

      return aiContent;
    } catch (error) {
      logger.error("AI resume parsing failed:", error);
      throw new Error("Failed to parse resume through AI");
    }
  }
}

module.exports = new ResumeService();
