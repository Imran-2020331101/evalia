// Base error classes
export { CustomApiError } from './CustomApiError';
export { BadRequestError } from './BadRequestError';
export { NotFoundError } from './NotFoundError';
export { UnauthenticatedError } from './UnauthenticatedError';
export { UnauthorizedError } from './UnauthorizedError';

// Resume-specific error classes
export {
  ResumeProcessingError,
  PDFParsingError,
  ResumeAnalysisError,
  InvalidFileTypeError,
  FileSizeLimitError,
  CloudinaryUploadError,
  ResumeNotFoundError,
  ResumeAlreadyExistsError,
  VectorDbError,
  VectorSearchError,
  PineconeConnectionError,
  JobDescriptionParsingError,
  CandidateSearchError,
  ShortlistGenerationError,
  OpenAIServiceError,
  OpenRouterServiceError,
  ExternalServiceTimeoutError,
  ResumeValidationError,
  MissingRequiredFieldError,
  ConfigurationError,
  EnvironmentVariableError,
  RateLimitExceededError,
} from './resumeErrors';
