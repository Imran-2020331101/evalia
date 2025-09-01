const axios = require('axios');
const resumeService = require('../services/resumeService');
const logger = require('../utils/logger');
const cloudinary = require('../config/Cloudinary');
const Resume = require('../models/Resume');
const ResumeDTO = require('../dto/ResumeDTO');
const { mapToResumeDTO } = require('../utils/resumeHelper');
const { z } = require('zod');
const {
  addToVectordb,
  naturalLanguageSearch,
  advancedSearch,
  weightedSearch,
} = require('../services/vectorDbService');

class ResumeController {
  async uploadResumeToCloud(req, res) {
    try {
      const pdfFile = req.file;
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
    } catch (error) {
      logger.error('Failed to upload resume to cloud : ', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload resume to cloud',
        details: error.message,
      });
    }
  }

  async extractDetailsFromResume(req, res) {
    const { resumeURL, userEmail } = req.body;
    try {
      const fileResponse = await axios.get(resumeURL, {
        responseType: 'arraybuffer',
      });

      console.log('PDF downloaded successfully.');

      const pdfFile = Buffer.from(fileResponse.data, 'binary');
      const extractedData = await resumeService.extractText(pdfFile.buffer);
      const analysis = await resumeService.analyzeResume(extractedData.text);

      // Create ResumeDTO with analyzed data for frontend
      const extractedResume = new ResumeDTO({
        filename: 'Parsed Resume',
        originalName: pdfFile.originalname,
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
    } catch (error) {
      logger.error('Resume extraction failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to extract resume ',
        details: error.message,
      });
    }
  }

  async saveResume(req, res) {
    try {
      const { resumeData, userId, userName, userEmail } = req.body;
      console.log(
        'Received parameters in job service ',
        userId,
        userName,
        resumeData.uploadedBy
      );

      if (!resumeData) {
        return res.status(400).json({
          success: false,
          error: 'Resume data is required',
        });
      }

      // Check if user already has a resume (one resume per email)
      const existingResume = await Resume.findOne({
        uploadedBy: resumeData.uploadedBy,
      });
      let savedResume;

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
      const vectorResult = await addToVectordb(
        savedResume.uploadedBy,
        savedResume,
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
    } catch (error) {
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
  async getResumeById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required',
        });
      }

      const resume = await Resume.findById(id);

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: 'Resume not found',
        });
      }

      logger.info('Retrieved resume by ID', {
        resumeId: id,
        userEmail: resume.uploadedBy,
        downloadUrl,
      });

      res.status(200).json({
        success: true,
        data: {
          ...resume.toObject(),
          downloadUrl: downloadUrl,
        },
      });
    } catch (error) {
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
  async getResumeByEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email address is required',
        });
      }

      const resume = await Resume.findOne({ uploadedBy: email });

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: 'Resume not found for this email',
        });
      }

      logger.info('Retrieved resume by email', {
        email: email,
        resumeId: resume._id,
        downloadUrl: resume.fileLink,
      });

      const resumeDTO = mapToResumeDTO(resume);

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
    } catch (error) {
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
  async downloadResume(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Resume ID is required',
        });
      }

      const resume = await Resume.findById(id);

      if (!resume) {
        return res.status(404).json({
          success: false,
          error: 'Resume not found',
        });
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
    } catch (error) {
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
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUploadStatus(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Resume upload service is running',
        timestamp: new Date().toISOString(),
        service: 'evalia-ai-server',
      });
    } catch (error) {
      logger.error('Status check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Service status check failed',
      });
    }
  }

  async searchCandidatesUsingNLP(req, res) {
    try {
      const { job_description } = req.body;

      if (!job_description) {
        return res.status(400).json({
          success: false,
          error: 'Job description is required',
        });
      }

      const requirement = await resumeService._extractDetailsFromJobDescription(
        job_description
      );

      console.log('job_description parsed ', requirement.industry);
      ``;
      const Candidates = await naturalLanguageSearch(requirement);

      console.log('Candidates from search:', Candidates);
      console.log('Is Candidates an array?', Array.isArray(Candidates));

      res.status(200).json({
        success: true,
        candidates: Candidates,
        message: 'Basic search completed successfully',
      });
    } catch (error) {
      logger.error('Basic search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform basic search',
        details: error.message,
      });
    }
  }
}

module.exports = new ResumeController();
