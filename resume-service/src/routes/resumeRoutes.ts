import express, { Router } from 'express';
import multer from 'multer';

// Import modules using ES6 imports
import cloudinary from '../config/Cloudinary';
import resumeController from '../controllers/resumeController';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      const error = new Error('Only PDF files are allowed') as any;
      cb(error, false);
    }
  }
});

const router: Router = express.Router();

/**
 * @route   POST /api/resume/upload
 * @desc    Upload and process resume PDF
 * @access  Public
 */
router.post(
  '/upload',
  upload.single('file'),
  resumeController.uploadResumeToCloud
);

router.post('/extract', resumeController.extractDetailsFromResume);

/**
 * @route   POST /api/resume/save
 * @desc    Save processed resume data to database
 * @access  Public
 */
router.post('/save', resumeController.saveResume);

/**
 * @route   POST /api/resume/retrive
 * @desc    Get resume by email address
 * @access  Public
 */
router.get('/retrieve', resumeController.getResumeByEmail);

/**
 * @route   GET /api/resume/status
 * @desc    Get upload service status
 * @access  Public
 */
router.get('/status', resumeController.getUploadStatus);

/**
 * @route   GET /api/resume/basic-search
 * @desc    Search the best matching candidates using Natural Language
 * @access  Public
 */
router.post('/shortlist/:k', resumeController.searchCandidatesUsingNLP);

/**
 * @route   GET /api/resume/:id
 * @desc    Get specific resume by ID
 * @access  Public
 */
router.get('/:resumeId', resumeController.getResumeById);
router.get('/:jobId/shortlist/:k', resumeController.generateAutomatedShortlist);

export default router;