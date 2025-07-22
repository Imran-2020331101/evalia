const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/Cloudinary");
const resumeController = require("../controllers/resumeController");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @route   POST /api/resume/upload
 * @desc    Upload and process resume PDF
 * @access  Public
 */
router.post("/upload", upload.single("file"), resumeController.uploadResume);



/**
 * @route   GET /api/resume/:id
 * @desc    Get specific resume by ID
 * @access  Public
 */
router.get("/:id", resumeController.getResumeById);

/**
 * @route   GET /api/resume/:id/download
 * @desc    Download resume PDF file
 * @access  Public
 */
router.get("/:id/download", resumeController.downloadResume);

/**
 * @route   GET /api/resume/status
 * @desc    Get upload service status
 * @access  Public
 */
router.get("/status", resumeController.getUploadStatus);

module.exports = router;
