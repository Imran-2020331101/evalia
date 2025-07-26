const resumeService = require("../services/resumeService");
const logger = require("../utils/logger");
const cloudinary = require("../config/Cloudinary");
const Resume = require("../models/Resume");
const ResumeDTO = require("../dto/ResumeDTO");
const {
  addToVectordb,
  searchVectordb,
  advancedSearch,
  weightedSearch,
} = require("../services/vectorDbService");

class ResumeController {
  
  async extractResume(req, res) {
    try {
      //using multer config. don't touch
      const pdfFile = req.file;
      const { userEmail, userId } = req.body;
      
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
      
      // Create proper download URL for PDF
      const downloadUrl = cloudinary.url(cloudinaryResult.public_id, {
        resource_type: "raw",
        flags: "attachment",
        format: "pdf",
      });
      
      // Create ResumeDTO with analyzed data for frontend
      const extractedResume = new ResumeDTO({
        filename: cloudinaryResult.public_id,
        originalName: pdfFile.originalname,
        fileLink: cloudinaryResult.secure_url,
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
        status: "completed",
      });
      
      const response = {
        success: true,
        data: {
          ...extractedResume.toObject(),
          downloadUrl: downloadUrl, // Add proper download URL
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
        "ResumeContoller :: line 106 :: Resume processing completed successfully"
      );
      
      res.status(200).json(response);
    } catch (error) {
      logger.error("Resume extraction failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process resume extraction",
        details: error.message,
      });
    }
  }
  

  async saveResume(req, res) {
    try {
      const resumeData = req.body;

      if (!resumeData) {
        return res.status(400).json({
          success: false,
          error: "Resume data is required",
        });
      }

      // Create Resume model instance and save to MongoDB
      const newResume = new Resume(resumeData);
      const savedResume = await newResume.save();

      logger.info("Resume Controller :: Resume saved to MongoDB", {
        resumeId: savedResume._id,
        filename: savedResume.filename,
        userEmail: savedResume.uploadedBy,
      });

      // Optional: Add to vector database for search
      const vectorResult = await addToVectordb(savedResume.uploadedBy, savedResume);

      res.status(200).json({
        success: true,
        message: "Resume saved successfully",
        data: {
          id: savedResume._id,
          filename: savedResume.filename,
          originalName: savedResume.originalName,
          status: savedResume.status,
        },
      });
    } catch (error) {
      logger.error("Failed to save resume:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save resume",
        details: error.message,
      });
    }
  }


  /**
   * Get specific resume by ID
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

  async getTopCandidates(req, res) {
    const { skills, experience, education, projects, userId } = req.body;
    //TODO:
  }
}

module.exports = new ResumeController();
