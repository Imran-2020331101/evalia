const express = require("express");
const { validateFileUpload } = require("../middleware/fileValidation");
const resumeController = require("../controllers/resumeController");

const router = express.Router();

/**
 * @route   POST /api/resume/upload
 * @desc    Upload and process resume PDF
 * @access  Public
 */
router.post("/upload", validateFileUpload, resumeController.uploadResume);

/**
 * @route   GET /api/resume/status
 * @desc    Get upload service status
 * @access  Public
 */
router.get("/status", resumeController.getUploadStatus);

module.exports = router;
