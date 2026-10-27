import { describe, it, expect } from 'vitest';
import * as E from '../../../src/errors/resumeErrors';
import * as barrel from '../../../src/errors';
import { CustomApiError } from '../../../src/errors/CustomApiError';

type Case = [string, () => CustomApiError, number, string, string[]];

const cases: Case[] = [
  ['ResumeProcessingError w/ reason', () => new E.ResumeProcessingError('parse', 'bad'), 500, 'Resume processing failed at parse: bad', ['RESUME_PROCESSING_ERROR']],
  ['ResumeProcessingError', () => new E.ResumeProcessingError('parse'), 500, 'Resume processing failed at parse', ['RESUME_PROCESSING_ERROR']],
  ['PDFParsingError w/ reason', () => new E.PDFParsingError('corrupt'), 422, 'Failed to parse PDF file: corrupt', ['PDF_PARSING_ERROR']],
  ['PDFParsingError', () => new E.PDFParsingError(), 422, 'Failed to parse PDF file', ['PDF_PARSING_ERROR']],
  ['ResumeAnalysisError w/ reason', () => new E.ResumeAnalysisError('llm'), 500, 'AI resume analysis failed: llm', ['RESUME_ANALYSIS_ERROR']],
  ['ResumeAnalysisError', () => new E.ResumeAnalysisError(), 500, 'AI resume analysis failed', ['RESUME_ANALYSIS_ERROR']],
  ['InvalidFileTypeError w/ type', () => new E.InvalidFileTypeError('image/png'), 400, 'Invalid file type: image/png. Only PDF files are allowed', ['INVALID_FILE_TYPE']],
  ['InvalidFileTypeError', () => new E.InvalidFileTypeError(), 400, 'Invalid file type. Only PDF files are allowed', ['INVALID_FILE_TYPE']],
  ['FileSizeLimitError w/ sizes', () => new E.FileSizeLimitError(20 * 1024 * 1024, 10 * 1024 * 1024), 413, 'File size 20MB exceeds limit of 10MB', ['FILE_SIZE_LIMIT_EXCEEDED']],
  ['FileSizeLimitError', () => new E.FileSizeLimitError(), 413, 'File size exceeds maximum allowed limit', ['FILE_SIZE_LIMIT_EXCEEDED']],
  ['CloudinaryUploadError w/ reason', () => new E.CloudinaryUploadError('net'), 500, 'Cloudinary upload failed: net', ['CLOUDINARY_UPLOAD_ERROR']],
  ['CloudinaryUploadError', () => new E.CloudinaryUploadError(), 500, 'Failed to upload file to cloud storage', ['CLOUDINARY_UPLOAD_ERROR']],
  ['ResumeNotFoundError w/ id', () => new E.ResumeNotFoundError('abc'), 404, 'Resume not found with identifier: abc', ['RESUME_NOT_FOUND']],
  ['ResumeNotFoundError', () => new E.ResumeNotFoundError(), 404, 'Resume not found', ['RESUME_NOT_FOUND']],
  ['ResumeAlreadyExistsError', () => new E.ResumeAlreadyExistsError('a@b.c'), 409, 'Resume already exists for user: a@b.c', ['RESUME_ALREADY_EXISTS']],
  ['VectorDbError w/ reason', () => new E.VectorDbError('insert', 'down'), 500, 'Vector database insert failed: down', ['VECTOR_DB_ERROR']],
  ['VectorDbError', () => new E.VectorDbError('insert'), 500, 'Vector database insert failed', ['VECTOR_DB_ERROR']],
  ['VectorSearchError w/ reason', () => new E.VectorSearchError('timeout'), 500, 'Vector search failed: timeout', ['VECTOR_SEARCH_ERROR']],
  ['VectorSearchError', () => new E.VectorSearchError(), 500, 'Vector search operation failed', ['VECTOR_SEARCH_ERROR']],
  ['JobDescriptionParsingError w/ reason', () => new E.JobDescriptionParsingError('x'), 422, 'Failed to parse job description: x', ['JOB_DESCRIPTION_PARSING_ERROR']],
  ['JobDescriptionParsingError', () => new E.JobDescriptionParsingError(), 422, 'Failed to parse job description', ['JOB_DESCRIPTION_PARSING_ERROR']],
  ['CandidateSearchError w/ reason', () => new E.CandidateSearchError('global', 'x'), 500, 'global search failed: x', ['CANDIDATE_SEARCH_ERROR']],
  ['CandidateSearchError', () => new E.CandidateSearchError('global'), 500, 'global search failed', ['CANDIDATE_SEARCH_ERROR']],
  ['ShortlistGenerationError w/ reason', () => new E.ShortlistGenerationError('j1', 'x'), 500, 'Failed to generate shortlist for job j1: x', ['SHORTLIST_GENERATION_ERROR']],
  ['ShortlistGenerationError', () => new E.ShortlistGenerationError('j1'), 500, 'Failed to generate shortlist for job j1', ['SHORTLIST_GENERATION_ERROR']],
  ['OpenAIServiceError w/ reason', () => new E.OpenAIServiceError('embed', 'x'), 502, 'OpenAI embed failed: x', ['OPENAI_SERVICE_ERROR']],
  ['OpenAIServiceError', () => new E.OpenAIServiceError('embed'), 502, 'OpenAI embed failed', ['OPENAI_SERVICE_ERROR']],
  ['OpenRouterServiceError w/ reason', () => new E.OpenRouterServiceError('chat', 'x'), 502, 'OpenRouter chat failed: x', ['OPENROUTER_SERVICE_ERROR']],
  ['OpenRouterServiceError', () => new E.OpenRouterServiceError('chat'), 502, 'OpenRouter chat failed', ['OPENROUTER_SERVICE_ERROR']],
  ['ExternalServiceTimeoutError', () => new E.ExternalServiceTimeoutError('Qdrant'), 504, 'Qdrant service request timed out', ['EXTERNAL_SERVICE_TIMEOUT']],
  ['ResumeValidationError w/ reason', () => new E.ResumeValidationError('email', 'bad'), 400, 'Resume validation failed for email: bad', ['INVALID_EMAIL']],
  ['ResumeValidationError', () => new E.ResumeValidationError('email'), 400, 'Resume validation failed for email', ['INVALID_EMAIL']],
  ['MissingRequiredFieldError', () => new E.MissingRequiredFieldError('file'), 400, 'Missing required field: file', ['MISSING_FILE']],
  ['ConfigurationError w/ reason', () => new E.ConfigurationError('db', 'x'), 500, 'Configuration error for db: x', ['CONFIGURATION_ERROR']],
  ['ConfigurationError', () => new E.ConfigurationError('db'), 500, 'Configuration error for db', ['CONFIGURATION_ERROR']],
  ['EnvironmentVariableError', () => new E.EnvironmentVariableError('FOO'), 500, 'Missing or invalid environment variable: FOO', ['ENV_VAR_ERROR']],
  ['RateLimitExceededError', () => new E.RateLimitExceededError('upload', 5, 'minute'), 429, 'Rate limit exceeded for upload. Limit: 5 requests per minute', ['RATE_LIMIT_EXCEEDED']],
];

describe('resume-specific errors', () => {
  it.each(cases)('%s', (_label, make, status, message, errors) => {
    const e = make();
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e.statusCode).toBe(status);
    expect(e.message).toBe(message);
    expect(e.errors).toEqual(errors);
    expect(e.name).toBe(e.constructor.name);
  });

  it('PineconeConnectionError is re-exported from the barrel but not defined', () => {
    // BUG: src/errors/index.ts re-exports PineconeConnectionError which resumeErrors.ts does not define.
    expect((E as any).PineconeConnectionError).toBeUndefined();
    expect((barrel as any).PineconeConnectionError).toBeUndefined();
  });

  it('barrel re-exports the base and resume errors', () => {
    expect(barrel.BadRequestError).toBeDefined();
    expect(barrel.NotFoundError).toBeDefined();
    expect(barrel.UnauthenticatedError).toBeDefined();
    expect(barrel.UnauthorizedError).toBeDefined();
    expect(barrel.CustomApiError).toBe(CustomApiError);
    expect(barrel.MissingRequiredFieldError).toBe(E.MissingRequiredFieldError);
  });
});
