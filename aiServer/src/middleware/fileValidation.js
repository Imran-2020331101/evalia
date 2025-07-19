const config = require("../config");
const logger = require("../utils/logger");

// File validation middleware
const validateFileUpload = (req, res, next) => {
  try {
    // Check if files exist
    if (!req.files || !req.files.pdfFile) {
      return res.status(400).json({
        success: false,
        error: "No PDF file provided",
      });
    }

    const file = req.files.pdfFile;

    // Check file type
    if (!config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: "Only PDF files are allowed",
      });
    }

    // Check file size
    if (file.size > config.MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds limit of ${
          config.MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      });
    }

    // Log file upload attempt
    logger.info("File validation passed", {
      filename: file.name,
      size: file.size,
      mimetype: file.mimetype,
      ip: req.ip,
    });

    next();
  } catch (error) {
    logger.error("File validation error:", error);
    res.status(500).json({
      success: false,
      error: "File validation failed",
    });
  }
};

module.exports = {
  validateFileUpload,
};
