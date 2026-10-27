import { describe, it, expect, vi, beforeEach } from 'vitest';

// config has no ALLOWED_FILE_TYPES (see BUG test at the bottom); provide it for the happy-path suites.
vi.mock('../../../src/config', () => ({
  default: { ALLOWED_FILE_TYPES: ['application/pdf'], MAX_FILE_SIZE: 1024 * 1024 },
}));

import validateFileUpload, { validateFile, validateMultipleFileUploads } from '../../../src/middleware/fileValidation';
import logger from '../../../src/utils/logger';

const MB = 1024 * 1024;
const file = (o: any = {}) => ({ name: 'a.pdf', size: 1000, mimetype: 'application/pdf', data: Buffer.alloc(0), md5: '', truncated: false, mv: vi.fn(), ...o });

function mocks(reqOver: any = {}) {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  const req: any = { ip: '1.1.1.1', get: vi.fn(() => 'UA'), body: {}, ...reqOver };
  return { req, res, next: vi.fn() };
}

describe('validateFile', () => {
  it('accepts a valid pdf and returns info', () => {
    const r = validateFile(file() as any);
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.fileInfo).toMatchObject({ name: 'a.pdf', size: 1000, mimetype: 'application/pdf' });
  });
  it('rejects wrong type, oversize, empty and truncated', () => {
    const r = validateFile(file({ mimetype: 'image/png', size: 2 * MB, truncated: true }) as any);
    expect(r.isValid).toBe(false);
    expect(r.errors).toEqual([
      'File type image/png is not allowed. Only PDF files are permitted.',
      'File size (2.00MB) exceeds limit of 1MB',
      'File appears to be corrupted or incomplete',
    ]);
    expect(validateFile(file({ size: 0 }) as any).errors).toEqual(['File is empty']);
  });
});

describe('validateFileUpload', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('passes a valid express-fileupload file', () => {
    const { req, res, next } = mocks({ files: { pdfFile: file() } });
    validateFileUpload(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith('File validation passed', expect.objectContaining({ filename: 'a.pdf' }));
  });

  it('400s an invalid express-fileupload file', () => {
    const { req, res, next } = mocks({ files: { pdfFile: file({ mimetype: 'text/plain' }) } });
    validateFileUpload(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'File validation failed', details: expect.any(Array) }));
    expect(logger.warn).toHaveBeenCalled();
  });

  it('passes a valid multer file', () => {
    const { req, res, next } = mocks({ file: { originalname: 'a.pdf', size: 10, mimetype: 'application/pdf' } });
    validateFileUpload(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith('Multer file validation passed', expect.any(Object));
  });

  it('400s an invalid multer file with every error', () => {
    const { req, res, next } = mocks({ file: { originalname: 'a.png', size: 0, mimetype: 'image/png' } });
    validateFileUpload(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].details).toEqual([
      'File type image/png is not allowed. Only PDF files are permitted.',
      'File is empty',
    ]);
    const o = mocks({ file: { originalname: 'a.pdf', size: 5 * MB, mimetype: 'application/pdf' } });
    validateFileUpload(o.req, o.res, o.next);
    expect(o.res.json.mock.calls[0][0].details[0]).toMatch(/exceeds limit of 1MB/);
  });

  it('400s when no file is provided', () => {
    const { req, res, next } = mocks();
    validateFileUpload(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'No PDF file provided' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('500s on unexpected exceptions (Error and non-Error)', () => {
    for (const thrown of [new Error('x'), 'str']) {
      const { req, res, next } = mocks({ files: { get pdfFile() { throw thrown; } } });
      validateFileUpload(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'File validation failed' }));
    }
  });
});

describe('validateMultipleFileUploads', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('400s when no files', () => {
    for (const req of [{}, { files: {} }]) {
      const { res, next } = mocks();
      validateMultipleFileUploads(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'No files provided' });
    }
  });

  it('passes when every file (single and array) is valid', () => {
    const { req, res, next } = mocks({ files: { a: file(), b: [file(), file()] } });
    validateMultipleFileUploads(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith('Multiple file validation passed', expect.objectContaining({ fileCount: 3 }));
  });

  it('aggregates errors across files', () => {
    const { req, res, next } = mocks({ files: { a: file({ size: 0 }), b: [file(), file({ mimetype: 'x/y' })] } });
    validateMultipleFileUploads(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    const details = res.json.mock.calls[0][0].details;
    expect(details).toHaveLength(2);
    expect(details[0]).toMatch(/^a\[0\]: File is empty/);
    expect(details[1]).toMatch(/^b\[1\]: File type x\/y/);
  });

  it('500s on unexpected exceptions', () => {
    for (const thrown of [new Error('x'), 'str']) {
      const { req, res, next } = mocks({ files: { a: null } });
      void thrown;
      validateMultipleFileUploads(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
    }
  });
});

describe('with the real config (no ALLOWED_FILE_TYPES)', () => {
  it('BUG: config.ALLOWED_FILE_TYPES is undefined, so every validation crashes with a 500', async () => {
    vi.resetModules();
    vi.doUnmock('../../../src/config');
    const real = await import('../../../src/middleware/fileValidation');
    const { req, res, next } = mocks({ file: { originalname: 'a.pdf', size: 10, mimetype: 'application/pdf' } });
    real.default(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});
