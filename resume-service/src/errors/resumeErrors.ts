import { CustomApiError } from './CustomApiError';

/**
 * Resume-specific custom error classes
 */

// ============ RESUME PROCESSING ERRORS ============

export class ResumeProcessingError extends CustomApiError {
  constructor(stage: string, reason?: string) {
    const message = reason 
      ? `Resume processing failed at ${stage}: ${reason}`
      : `Resume processing failed at ${stage}`;
    super(message, 500, ['RESUME_PROCESSING_ERROR']);
    this.name = 'ResumeProcessingError';
  }
}

export class PDFParsingError extends CustomApiError {
  constructor(reason?: string) {
    const message = reason 
      ? `Failed to parse PDF file: ${reason}`
      : 'Failed to parse PDF file';
    super(message, 422, ['PDF_PARSING_ERROR']);
    this.name = 'PDFParsingError';
  }
}

export class ResumeAnalysisError extends CustomApiError {
  constructor(reason?: string) {
    const message = reason 
      ? `AI resume analysis failed: ${reason}`
      : 'AI resume analysis failed';
    super(message, 500, ['RESUME_ANALYSIS_ERROR']);
    this.name = 'ResumeAnalysisError';
  }
}

export class InvalidFileTypeError extends CustomApiError {
  constructor(fileType?: string) {
    const message = fileType 
      ? `Invalid file type: ${fileType}. Only PDF files are allowed`
      : 'Invalid file type. Only PDF files are allowed';
    super(message, 400, ['INVALID_FILE_TYPE']);
    this.name = 'InvalidFileTypeError';
  }
}

export class FileSizeLimitError extends CustomApiError {
  constructor(size?: number, limit?: number) {
    const message = size && limit
      ? `File size ${Math.round(size/1024/1024)}MB exceeds limit of ${Math.round(limit/1024/1024)}MB`
      : 'File size exceeds maximum allowed limit';
    super(message, 413, ['FILE_SIZE_LIMIT_EXCEEDED']);
    this.name = 'FileSizeLimitError';
  }
}

// ============ STORAGE ERRORS ============

export class CloudinaryUploadError extends CustomApiError {
  constructor(reason?: string) {
    const message = reason 
      ? `Cloudinary upload failed: ${reason}`
      : 'Failed to upload file to cloud storage';
    super(message, 500, ['CLOUDINARY_UPLOAD_ERROR']);
    this.name = 'CloudinaryUploadError';
  }
}

export class ResumeNotFoundError extends CustomApiError {
  constructor(identifier?: string) {
    const message = identifier 
      ? `Resume not found with identifier: ${identifier}`
      : 'Resume not found';
    super(message, 404, ['RESUME_NOT_FOUND']);
    this.name = 'ResumeNotFoundError';
  }
}

export class ResumeAlreadyExistsError extends CustomApiError {
  constructor(email: string) {
    super(`Resume already exists for user: ${email}`, 409, ['RESUME_ALREADY_EXISTS']);
    this.name = 'ResumeAlreadyExistsError';
  }
}

// ============ VECTOR DATABASE ERRORS ============

export class VectorDbError extends CustomApiError {
  constructor(operation: string, reason?: string) {
    const message = reason 
      ? `Vector database ${operation} failed: ${reason}`
      : `Vector database ${operation} failed`;
    super(message, 500, ['VECTOR_DB_ERROR']);
    this.name = 'VectorDbError';
  }
}

export class VectorSearchError extends CustomApiError {
  constructor(reason?: string) {
    const message = reason 
      ? `Vector search failed: ${reason}`
      : 'Vector search operation failed';
    super(message, 500, ['VECTOR_SEARCH_ERROR']);
    this.name = 'VectorSearchError';
  }
}

export class PineconeConnectionError extends CustomApiError {
  constructor() {
    super('Failed to connect to Pinecone vector database', 503, ['PINECONE_CONNECTION_ERROR']);
    this.name = 'PineconeConnectionError';
  }
}

// ============ JOB MATCHING ERRORS ============

export class JobDescriptionParsingError extends CustomApiError {
  constructor(reason?: string) {
    const message = reason 
      ? `Failed to parse job description: ${reason}`
      : 'Failed to parse job description';
    super(message, 422, ['JOB_DESCRIPTION_PARSING_ERROR']);
    this.name = 'JobDescriptionParsingError';
  }
}

export class CandidateSearchError extends CustomApiError {
  constructor(searchType: string, reason?: string) {
    const message = reason 
      ? `${searchType} search failed: ${reason}`
      : `${searchType} search failed`;
    super(message, 500, ['CANDIDATE_SEARCH_ERROR']);
    this.name = 'CandidateSearchError';
  }
}

export class ShortlistGenerationError extends CustomApiError {
  constructor(jobId: string, reason?: string) {
    const message = reason 
      ? `Failed to generate shortlist for job ${jobId}: ${reason}`
      : `Failed to generate shortlist for job ${jobId}`;
    super(message, 500, ['SHORTLIST_GENERATION_ERROR']);
    this.name = 'ShortlistGenerationError';
  }
}

// ============ EXTERNAL SERVICE ERRORS ============

export class OpenAIServiceError extends CustomApiError {
  constructor(operation: string, reason?: string) {
    const message = reason 
      ? `OpenAI ${operation} failed: ${reason}`
      : `OpenAI ${operation} failed`;
    super(message, 502, ['OPENAI_SERVICE_ERROR']);
    this.name = 'OpenAIServiceError';
  }
}

export class OpenRouterServiceError extends CustomApiError {
  constructor(operation: string, reason?: string) {
    const message = reason 
      ? `OpenRouter ${operation} failed: ${reason}`
      : `OpenRouter ${operation} failed`;
    super(message, 502, ['OPENROUTER_SERVICE_ERROR']);
    this.name = 'OpenRouterServiceError';
  }
}

export class ExternalServiceTimeoutError extends CustomApiError {
  constructor(serviceName: string) {
    super(`${serviceName} service request timed out`, 504, ['EXTERNAL_SERVICE_TIMEOUT']);
    this.name = 'ExternalServiceTimeoutError';
  }
}

// ============ DATA VALIDATION ERRORS ============

export class ResumeValidationError extends CustomApiError {
  constructor(field: string, reason?: string) {
    const message = reason 
      ? `Resume validation failed for ${field}: ${reason}`
      : `Resume validation failed for ${field}`;
    super(message, 400, [`INVALID_${field.toUpperCase()}`]);
    this.name = 'ResumeValidationError';
  }
}

export class MissingRequiredFieldError extends CustomApiError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, 400, [`MISSING_${field.toUpperCase()}`]);
    this.name = 'MissingRequiredFieldError';
  }
}

// ============ CONFIGURATION ERRORS ============

export class ConfigurationError extends CustomApiError {
  constructor(configName: string, reason?: string) {
    const message = reason 
      ? `Configuration error for ${configName}: ${reason}`
      : `Configuration error for ${configName}`;
    super(message, 500, ['CONFIGURATION_ERROR']);
    this.name = 'ConfigurationError';
  }
}

export class EnvironmentVariableError extends CustomApiError {
  constructor(variable: string) {
    super(`Missing or invalid environment variable: ${variable}`, 500, ['ENV_VAR_ERROR']);
    this.name = 'EnvironmentVariableError';
  }
}

// ============ RATE LIMITING ERRORS ============

export class RateLimitExceededError extends CustomApiError {
  constructor(operation: string, limit: number, window: string) {
    super(`Rate limit exceeded for ${operation}. Limit: ${limit} requests per ${window}`, 429, ['RATE_LIMIT_EXCEEDED']);
    this.name = 'RateLimitExceededError';
  }
}
