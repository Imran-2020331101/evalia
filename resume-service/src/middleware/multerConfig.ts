import multer from "multer";
import path from "path";
import fs from "fs";
const config = require("../config");

// Type definitions for multer configuration
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

interface MulterRequest extends Request {
  file?: MulterFile;
  files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
}

type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;

interface StorageDestinationCallback {
  (error: Error | null, destination: string): void;
}

interface StorageFilenameCallback {
  (error: Error | null, filename: string): void;
}

// Allowed MIME types for validation
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/vnd.pdf',
  'text/pdf',
  'text/x-pdf'
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf'];

/**
 * Ensure upload directories exist
 * @param dirPath - Directory path to create
 */
const ensureUploadDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generate unique filename with timestamp and random suffix
 * @param originalName - Original filename
 * @param fieldname - Form field name
 * @returns Unique filename with extension
 */
const generateUniqueFilename = (originalName: string, fieldname: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1e9);
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, extension);
  
  // Sanitize the base name (remove special characters)
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return `${fieldname}-${sanitizedBaseName}-${timestamp}-${randomSuffix}${extension}`;
};

/**
 * Validate file extension and MIME type
 * @param file - Multer file object
 * @returns Boolean indicating if file is valid
 */
const isValidFileType = (file: MulterFile): boolean => {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();
  
  return ALLOWED_EXTENSIONS.includes(extension) && 
         ALLOWED_MIME_TYPES.includes(mimeType);
};

// Configure storage with enhanced functionality
const storage = multer.diskStorage({
  destination: (req: any, file: MulterFile, cb: StorageDestinationCallback) => {
    try {
      // Create different directories based on file type or user
      const baseUploadDir = path.join(__dirname, "../../uploads");
      const tempDir = path.join(baseUploadDir, "temp");
      const processedDir = path.join(baseUploadDir, "processed");
      
      // Ensure directories exist
      ensureUploadDir(baseUploadDir);
      ensureUploadDir(tempDir);
      ensureUploadDir(processedDir);
      
      // Store files in temp directory for initial processing
      cb(null, tempDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req: any, file: MulterFile, cb: StorageFilenameCallback) => {
    try {
      // Generate unique filename with original extension
      const uniqueFilename = generateUniqueFilename(file.originalname, file.fieldname);
      cb(null, uniqueFilename);
    } catch (error) {
      cb(error as Error, '');
    }
  },
});

// Enhanced file filter with detailed validation
const fileFilter = (req: any, file: MulterFile, cb: FileFilterCallback): void => {
  try {
    // Validate file type
    if (!isValidFileType(file)) {
      const error = new Error(
        `Invalid file type. Only PDF files are allowed. ` +
        `Received: ${file.mimetype} (${path.extname(file.originalname)})`
      );
      error.name = 'INVALID_FILE_TYPE';
      cb(error, false);
      return;
    }

    // Additional validation for file name
    if (!file.originalname || file.originalname.trim() === '') {
      const error = new Error('File name is required');
      error.name = 'INVALID_FILE_NAME';
      cb(error, false);
      return;
    }

    // Check for potentially dangerous file names
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Reserved Windows names
    ];

    if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
      const error = new Error('Invalid characters in file name');
      error.name = 'UNSAFE_FILE_NAME';
      cb(error, false);
      return;
    }

    // File is valid
    cb(null, true);
  } catch (error) {
    cb(error as Error, false);
  }
};

// Create multer instance with comprehensive configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE || 10 * 1024 * 1024, // Default 10MB
    files: 5, // Maximum number of files
    parts: 10, // Maximum number of parts (non-file fields + files)
    headerPairs: 2000, // Maximum number of header key-value pairs
  },
  fileFilter: fileFilter,
});

// Create memory storage for immediate processing (without saving to disk)
const memoryStorage = multer.memoryStorage();

const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: config.MAX_FILE_SIZE || 10 * 1024 * 1024,
    files: 5,
  },
  fileFilter: fileFilter,
});

/**
 * Cleanup uploaded files (for temporary files)
 * @param filePaths - Array of file paths to delete
 */
const cleanupFiles = async (filePaths: string[]): Promise<void> => {
  const deletePromises = filePaths.map(async (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
    }
  });

  await Promise.all(deletePromises);
};

/**
 * Get file information from multer file object
 * @param file - Multer file object
 * @returns File information object
 */
const getFileInfo = (file: MulterFile): {
  originalName: string;
  filename: string;
  size: number;
  sizeInMB: number;
  mimetype: string;
  extension: string;
  path?: string;
} => {
  return {
    originalName: file.originalname,
    filename: file.filename || 'memory-file',
    size: file.size,
    sizeInMB: Number((file.size / (1024 * 1024)).toFixed(2)),
    mimetype: file.mimetype,
    extension: path.extname(file.originalname).toLowerCase(),
    path: file.path,
  };
};

// Export configurations
export default upload;

export {
  memoryUpload,
  cleanupFiles,
  getFileInfo,
  generateUniqueFilename,
  isValidFileType,
  ensureUploadDir,
  MulterFile,
  MulterRequest,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};