const pdfService = require("../services/pdfService");
const logger = require("../utils/logger");

class ResumeController {
  /**
   * Upload and process resume
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadResume(req, res) {
    try {
      const pdfFile = req.files.pdfFile;

      logger.info("Processing resume upload", {
        filename: pdfFile.name,
        size: pdfFile.size,
        mimetype: pdfFile.mimetype,
      });

      // Extract text from PDF
      const extractedData = await pdfService.extractText(pdfFile.data);

      // Analyze resume content
      const analysis = pdfService.analyzeResume(extractedData.text);

      // Prepare response
      const response = {
        success: true,
        data: {
          filename: pdfFile.name,
          extractedText: extractedData.text,
          metadata: extractedData.metadata,
          analysis: analysis,
          uploadedAt: new Date().toISOString(),
        },
      };

      logger.info("Resume processing completed successfully", {
        filename: pdfFile.name,
        textLength: extractedData.text.length,
        sectionsFound: analysis.sections.length,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error("Resume upload processing failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process resume upload",
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
