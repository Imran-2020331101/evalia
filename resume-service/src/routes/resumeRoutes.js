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
router.post("/upload", upload.single("file"), resumeController.uploadResumeToCloud);

router.post("/extract", resumeController.extractDetailsFromResume);

/**
 * @route   POST /api/resume/save
 * @desc    Save processed resume data to database
 * @access  Public
 */
router.post("/save", resumeController.saveResume);

/**
 * @route   POST /api/resume/retrive
 * @desc    Get resume by email address
 * @access  Public
 */
router.post("/retrieve", resumeController.getResumeByEmail);

/**
 * @route   GET /api/resume/status
 * @desc    Get upload service status
 * @access  Public
 */
router.get("/status", resumeController.getUploadStatus);

/**
 * @route   GET /api/resume/basic-search
 * @desc    Search the best matching candidates using Natural Language
 * @access  Public
 */
router.post("/basic-search", resumeController.searchCandidatesUsingNLP);

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


module.exports = router;
