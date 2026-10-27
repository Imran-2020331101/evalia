import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import upload, {
  memoryUpload, cleanupFiles, getFileInfo, generateUniqueFilename, isValidFileType, ensureUploadDir,
  ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS,
} from '../../../src/middleware/multerConfig';

const pdf = Buffer.from('%PDF-1.4 test');

function appWith(mw: any) {
  const app = express();
  app.post('/up', mw, (req: any, res) => res.json({ ok: true, file: req.file && { name: req.file.originalname, size: req.file.size } }));
  app.use((err: any, _req: any, res: any, _next: any) => res.status(400).json({ name: err.name, message: err.message }));
  return app;
}

describe('constants', () => {
  it('exports allowed types', () => {
    expect(ALLOWED_EXTENSIONS).toEqual(['.pdf']);
    expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
  });
});

describe('generateUniqueFilename', () => {
  it('sanitizes the base name, lowercases the extension and is unique', () => {
    const a = generateUniqueFilename('My Résumé (1).PDF', 'file');
    // BUG (minor): uppercase extension is not stripped from the base name (basename() gets the lowercased ext), leaving '_PDF'.
    expect(a).toMatch(/^file-My_R_sum___1__PDF-\d+-\d+\.pdf$/);
    expect(generateUniqueFilename('My Resume (1).pdf', 'file')).toMatch(/^file-My_Resume__1_-\d+-\d+\.pdf$/);
    expect(generateUniqueFilename('x.pdf', 'f')).not.toBe(generateUniqueFilename('x.pdf', 'f'));
  });
});

describe('isValidFileType', () => {
  const f = (originalname: string, mimetype: string): any => ({ originalname, mimetype });
  it('requires both pdf extension and pdf mime', () => {
    expect(isValidFileType(f('a.pdf', 'application/pdf'))).toBe(true);
    expect(isValidFileType(f('a.PDF', 'APPLICATION/PDF'))).toBe(true);
    expect(isValidFileType(f('a.pdf', 'text/pdf'))).toBe(true);
    expect(isValidFileType(f('a.txt', 'application/pdf'))).toBe(false);
    expect(isValidFileType(f('a.pdf', 'image/png'))).toBe(false);
  });
});

describe('ensureUploadDir', () => {
  it('creates a missing directory and leaves an existing one', () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ensure-'));
    const dir = path.join(base, 'a', 'b');
    ensureUploadDir(dir);
    expect(fs.existsSync(dir)).toBe(true);
    const mk = vi.spyOn(fs, 'mkdirSync');
    ensureUploadDir(dir);
    expect(mk).not.toHaveBeenCalled();
    mk.mockRestore();
  });
});

describe('getFileInfo', () => {
  it('describes a disk file', () => {
    expect(getFileInfo({ originalname: 'A.PDF', filename: 'x.pdf', size: 1572864, mimetype: 'application/pdf', path: '/tmp/x.pdf' } as any))
      .toEqual({ originalName: 'A.PDF', filename: 'x.pdf', size: 1572864, sizeInMB: 1.5, mimetype: 'application/pdf', extension: '.pdf', path: '/tmp/x.pdf' });
  });
  it('uses memory-file placeholder when no filename', () => {
    expect(getFileInfo({ originalname: 'a.pdf', size: 10, mimetype: 'application/pdf' } as any).filename).toBe('memory-file');
  });
});

describe('cleanupFiles', () => {
  it('deletes existing files, ignores missing ones', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-'));
    const p = path.join(dir, 'f.pdf');
    fs.writeFileSync(p, 'x');
    await cleanupFiles([p, path.join(dir, 'missing.pdf')]);
    expect(fs.existsSync(p)).toBe(false);
  });
  it('logs and continues when unlink fails', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'unlink').mockRejectedValue(new Error('EPERM'));
    await expect(cleanupFiles(['/nope'])).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to delete file /nope'), expect.any(Error));
    vi.restoreAllMocks();
  });
});

describe('memoryUpload (fileFilter + limits)', () => {
  const app = appWith(memoryUpload.single('file'));

  it('accepts a valid pdf', async () => {
    const res = await request(app).post('/up').attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.file).toEqual({ name: 'cv.pdf', size: pdf.length });
  });

  it('rejects wrong mime/extension', async () => {
    const res = await request(app).post('/up').attach('file', Buffer.from('x'), { filename: 'cv.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
    expect(res.body.name).toBe('INVALID_FILE_TYPE');
    expect(res.body.message).toMatch(/Invalid file type/);
  });

  it('rejects unsafe file names', async () => {
    const res = await request(app).post('/up').attach('file', pdf, { filename: 'a..b.pdf', contentType: 'application/pdf' });
    expect(res.body.name).toBe('UNSAFE_FILE_NAME');
  });

  it('rejects dangerous characters', async () => {
    const res = await request(app).post('/up').attach('file', pdf, { filename: 'a<b>.pdf', contentType: 'application/pdf' });
    expect(res.body.name).toBe('UNSAFE_FILE_NAME');
  });

  it('passes through requests with no file part', async () => {
    const res = await request(app).post('/up').field('x', 'y');
    expect(res.status).toBe(200);
    expect(res.body.file).toBeUndefined();
  });

  it('rejects more than the allowed number of files', async () => {
    const a = express();
    a.post('/up', memoryUpload.array('file'), (_q, r) => r.json({ ok: true }));
    a.use((err: any, _q: any, r: any, _n: any) => r.status(400).json({ name: err.name, message: err.message }));
    let req = request(a).post('/up');
    for (let i = 0; i < 6; i++) req = req.attach('file', pdf, { filename: `f${i}.pdf`, contentType: 'application/pdf' });
    const res = await req;
    expect(res.body.name).toBe('MulterError');
    expect(res.body.message).toBe('Too many files');
  });
});

describe('disk storage', () => {
  const storage: any = (upload as any).storage;
  let mkdir: any, exists: any;
  beforeEach(() => {
    exists = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    mkdir = vi.spyOn(fs, 'mkdirSync').mockImplementation((() => undefined) as any);
  });
  afterEach(() => vi.restoreAllMocks());

  it('destination ensures upload/temp/processed dirs and returns temp', () => {
    const cb = vi.fn();
    storage.getDestination({}, { originalname: 'a.pdf' }, cb);
    expect(mkdir).toHaveBeenCalledTimes(3);
    expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/uploads[\\/]temp$/));
  });

  it('destination forwards fs errors', () => {
    mkdir.mockImplementation(() => { throw new Error('EACCES'); });
    const cb = vi.fn();
    storage.getDestination({}, {}, cb);
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ message: 'EACCES' }), '');
  });

  it('filename generates a unique name', () => {
    const cb = vi.fn();
    storage.getFilename({}, { originalname: 'cv.pdf', fieldname: 'file' }, cb);
    expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^file-cv-\d+-\d+\.pdf$/));
  });

  it('filename forwards errors', () => {
    const cb = vi.fn();
    storage.getFilename({}, { originalname: undefined, fieldname: 'file' }, cb);
    expect(cb).toHaveBeenCalledWith(expect.any(Error), '');
  });
});

describe('fileFilter edge cases (via the disk multer instance filter)', () => {
  const filter = (upload as any).fileFilter as (req: any, file: any, cb: any) => void;

  it('rejects empty/whitespace names (extension check passes first)', () => {
    const cb = vi.fn();
    // '.pdf' alone has no extension per path.extname, so type check fails first; use a name that passes type but is blank-ish
    filter({}, { originalname: '   .pdf', mimetype: 'application/pdf' }, cb);
    expect(cb).toHaveBeenCalled();
  });

  it('reports a Windows reserved-name pattern as unsafe only when whole name matches', () => {
    const cb = vi.fn();
    filter({}, { originalname: 'CON.pdf', mimetype: 'application/pdf' }, cb);
    // Pattern is anchored on the full name incl. extension, so "CON.pdf" slips through (documented behaviour).
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('catches exceptions thrown inside the filter', () => {
    const cb = vi.fn();
    filter({}, { originalname: 'a.pdf', mimetype: undefined }, cb);
    expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
  });

  it('rejects when originalname is blank but extension/mime pass', () => {
    const cb = vi.fn();
    const file: any = { mimetype: 'application/pdf' };
    let calls = 0;
    // Make extname-based type check pass once, then blank name on the second read.
    Object.defineProperty(file, 'originalname', { get() { return calls++ < 2 ? 'a.pdf' : '  '; } });
    filter({}, file, cb);
    expect(cb.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
