const resumeService = require("../services/resumeService");
const logger = require("../utils/logger");
const cloudinary = require("../config/Cloudinary");
const Resume = require("../models/Resume");

class ResumeController {
  /**
   * Upload and process resume
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadResume(req, res) {
    try {
      // Multer stores file info in req.file (not req.files)
      const pdfFile = req.file;
      const userEmail = req.body.email || req.query.email;

      if (!pdfFile) {
        return res.status(400).json({
          success: false,
          error: "No PDF file provided",
        });
      }

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error: "User email is required",
        });
      }

      logger.info("Processing resume upload", {
        filename: pdfFile.originalname,
        size: pdfFile.size,
        mimetype: pdfFile.mimetype,
        userEmail: userEmail,
      });

      // Extract text from PDF buffer
      const extractedData = await resumeService.extractText(pdfFile.buffer);

      // Analyze resume content (skills, experience, etc.)
      const analysis = await resumeService.analyzeResume(extractedData.text);



      // Upload PDF to Cloudinary
      const folderName = "evalia/resume/pdf";
      const cloudinaryResult = await resumeService.uploadToCloudinary(
        pdfFile.buffer,
        pdfFile.originalname,
        folderName
      );

      // Save to MongoDB with flattened structure
      const resumeData = new Resume({
        filename: cloudinaryResult.public_id,
        originalName: pdfFile.originalname,
        fileLink: cloudinaryResult.secure_url,
        metadata: extractedData.metadata,

        // Basic analysis data
        analysis: {
          wordCount: analysis.wordCount,
          characterCount: analysis.characterCount,
          hasEmail: analysis.hasEmail,
          hasPhone: analysis.hasPhone,
          sections: analysis.sections,
          keywords: analysis.keywords,
        },

        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        projects: analysis.projects,

        contact: {
          emails: analysis.email,
          phones: analysis.phone,
          linkedin: analysis.linkedin,
          github: analysis.github,
          location: analysis.location,
        },

        uploadedBy: userEmail,
        status: "completed",
        processedAt: new Date(),
      });
      const savedResume = await resumeData.save();

      // Create proper download URL for PDF
      const downloadUrl = cloudinary.url(cloudinaryResult.public_id, {
        resource_type: "raw",
        flags: "attachment",
        // Don't specify format to avoid double extension
      });

      // Prepare enhanced response
      const response = {
        success: true,
        data: {
          ...savedResume.toObject(),
          downloadUrl: downloadUrl, // Add proper download URL
          originalFileLink: cloudinaryResult.secure_url, // Keep original for reference
        },
      };

      logger.info(
        "ResumeContoller :: line 106 :: Resume processing completed successfully"
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Resume upload processing failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process resume upload",
        details: error.message,
      });
    }
  }

  /**
   * Get specific resume by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getResumeById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Resume ID is required",
        });
      }

      const resume = await Resume.findById(id);

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: "Resume not found",
        });
      }

      // Add download URL to response
      const downloadUrl = cloudinary.url(resume.filename, {
        resource_type: "raw",
        flags: "attachment",
        format: "pdf",
      });

      logger.info("Retrieved resume by ID", {
        resumeId: id,
        userEmail: resume.uploadedBy,
      });

      res.status(200).json({
        success: true,
        data: {
          ...resume.toObject(),
          downloadUrl: downloadUrl,
        },
      });
    } catch (error) {
      logger.error("Failed to retrieve resume by ID:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve resume",
        details: error.message,
      });
    }
  }

  /**
   * Download resume PDF file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downloadResume(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Resume ID is required",
        });
      }

      const resume = await Resume.findById(id);

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: "Resume not found",
        });
      }

      // Generate download URL with proper PDF headers
      const downloadUrl = cloudinary.url(resume.filename, {
        resource_type: "raw",
        flags: "attachment",
        format: "pdf",
      });

      // Set proper headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${resume.originalName}"`
      );

      // Redirect to Cloudinary download URL
      res.redirect(downloadUrl);

      logger.info("Resume download initiated", {
        resumeId: id,
        filename: resume.originalName,
        userEmail: resume.uploadedBy,
      });
    } catch (error) {
      logger.error("Failed to download resume:", error);
      res.status(500).json({
        success: false,
        error: "Failed to download resume",
        details: error.message,
      });
    }
  }

  /**
   * Get upload status/health check
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUploadStatus(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: "Resume upload service is running",
        timestamp: new Date().toISOString(),
        service: "evalia-ai-server",
      });
    } catch (error) {
      logger.error("Status check failed:", error);
      res.status(500).json({
        success: false,
        error: "Service status check failed",
      });
    }
  }
}

module.exports = new ResumeController();
