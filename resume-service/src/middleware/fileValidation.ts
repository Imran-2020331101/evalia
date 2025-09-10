import config from "../config";
import logger from "../utils/logger";

// Type definitions for file validation
interface FileObject {
  name: string;
  size: number;
  mimetype: string;
  data: Buffer;
  md5: string;
  tempFilePath?: string;
  truncated: boolean;
  mv: (path: string) => Promise<void>;
}

interface RequestWithFiles extends Request {
  files?: {
    pdfFile?: FileObject;
    [key: string]: FileObject | FileObject[] | undefined;
  };
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
  ip?: string;
}

interface ValidationError {
  success: false;
  error: string;
  details?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fileInfo?: {
    name: string;
    size: number;
    mimetype: string;
    sizeInMB: number;
  };
}

/**
 * Validate file properties against configuration limits
 * @param file - File object to validate
 * @returns Validation result with errors if any
 */
const validateFile = (file: FileObject): ValidationResult => {
  const errors: string[] = [];

  // Check file type
  if (!config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed. Only PDF files are permitted.`);
  }

  // Check file size
  if (file.size > config.MAX_FILE_SIZE) {
    const maxSizeMB = config.MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = file.size / (1024 * 1024);
    errors.push(`File size (${fileSizeMB.toFixed(2)}MB) exceeds limit of ${maxSizeMB}MB`);
  }

  // Check for empty files
  if (file.size === 0) {
    errors.push("File is empty");
  }

  // Check for corrupted files (basic check)
  if (file.truncated) {
    errors.push("File appears to be corrupted or incomplete");
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      sizeInMB: file.size / (1024 * 1024),
    },
  };
};

/**
 * File validation middleware for PDF uploads
 * Validates file type, size, and integrity
 * @param req - Express Request object with file data
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
const validateFileUpload = (req: any, res: any, next: any): void => {
  try {
    // Check for file upload using express-fileupload (req.files)
    if (req.files && req.files.pdfFile) {
      const file = req.files.pdfFile as FileObject;
      const validation = validateFile(file);

      if (!validation.isValid) {
        logger.warn("File validation failed", {
          filename: file.name,
          errors: validation.errors,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        return res.status(400).json({
          success: false,
          error: "File validation failed",
          details: validation.errors,
        } as ValidationError);
      }

      // Log successful validation
      logger.info("File validation passed", {
        filename: file.name,
        size: file.size,
        sizeInMB: validation.fileInfo?.sizeInMB.toFixed(2),
        mimetype: file.mimetype,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      next();
      return;
    }

    // Check for file upload using multer (req.file)
    if (req.file) {
      const file = req.file;

      // Basic validation for multer uploads
      const errors: string[] = [];

      if (!config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        errors.push(`File type ${file.mimetype} is not allowed. Only PDF files are permitted.`);
      }

      if (file.size > config.MAX_FILE_SIZE) {
        const maxSizeMB = config.MAX_FILE_SIZE / (1024 * 1024);
        const fileSizeMB = file.size / (1024 * 1024);
        errors.push(`File size (${fileSizeMB.toFixed(2)}MB) exceeds limit of ${maxSizeMB}MB`);
      }

      if (file.size === 0) {
        errors.push("File is empty");
      }

      if (errors.length > 0) {
        logger.warn("Multer file validation failed", {
          filename: file.originalname,
          errors: errors,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        return res.status(400).json({
          success: false,
          error: "File validation failed",
          details: errors,
        } as ValidationError);
      }

      // Log successful validation
      logger.info("Multer file validation passed", {
        filename: file.originalname,
        size: file.size,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        mimetype: file.mimetype,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      next();
      return;
    }

    // No file found
    logger.warn("No file provided in upload request", {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
    });

    return res.status(400).json({
      success: false,
      error: "No PDF file provided",
      details: ["Please upload a PDF file using the 'pdfFile' field or 'file' field"],
    } as ValidationError);

  } catch (error) {
    logger.error("File validation error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(500).json({
      success: false,
      error: "File validation failed",
      details: ["Internal server error during file validation"],
    } as ValidationError);
  }
};

/**
 * Validate multiple file uploads
 * @param req - Express Request object
 * @param res - Express Response object  
 * @param next - Express NextFunction
 */
const validateMultipleFileUploads = (req: any, res: any, next: any): void => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files provided",
      } as ValidationError);
    }

    const validationErrors: string[] = [];
    const fileInfos: any[] = [];

    // Validate each file
    Object.entries(req.files).forEach(([fieldName, fileOrFiles]) => {
      const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      
      files.forEach((file: any, index: number) => {
        const validation = validateFile(file as FileObject);
        
        if (!validation.isValid) {
          validationErrors.push(`${fieldName}[${index}]: ${validation.errors.join(', ')}`);
        } else {
          fileInfos.push({
            fieldName,
            index,
            ...validation.fileInfo,
          });
        }
      });
    });

    if (validationErrors.length > 0) {
      logger.warn("Multiple file validation failed", {
        errors: validationErrors,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      return res.status(400).json({
        success: false,
        error: "File validation failed",
        details: validationErrors,
      } as ValidationError);
    }

    logger.info("Multiple file validation passed", {
      fileCount: fileInfos.length,
      files: fileInfos,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    next();
  } catch (error) {
    logger.error("Multiple file validation error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
    });

    res.status(500).json({
      success: false,
      error: "File validation failed",
    } as ValidationError);
  }
};

export default validateFileUpload;
export {
  validateFileUpload,
  validateMultipleFileUploads,
  validateFile,
  FileObject,
  RequestWithFiles,
  ValidationError,
  ValidationResult,
};