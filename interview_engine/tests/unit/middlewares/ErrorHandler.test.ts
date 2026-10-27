import { describe, it, expect } from 'vitest';
import { errorHandlerMiddleware } from '../../../src/middlewares/ErrorHandler';
import { CustomApiError, BadRequestError, NotFoundError } from '../../../src/errors';
import { mockRes } from '../../helpers/testApp';

function run(err: any) {
  const res = mockRes();
  const next = () => { throw new Error('next should not be called'); };
  errorHandlerMiddleware(err, {} as any, res, next);
  return res;
}
const named = (name: string, extra: object = {}, message = 'm') =>
  Object.assign(new Error(message), { name }, extra);

describe('errorHandlerMiddleware', () => {
  it('maps CustomApiError to its status with {msg}', () => {
    const res = run(new BadRequestError('bad input'));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'bad input' });
  });

  it('maps NotFoundError to 404', () => {
    const res = run(new NotFoundError('gone'));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'gone' });
  });

  it('maps a bare CustomApiError to 500 with its message', () => {
    const res = run(new CustomApiError('x'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: 'x' });
  });

  it('maps DocumentNotFoundError to 404', () => {
    const res = run(named('DocumentNotFoundError'));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Resource not found' });
  });

  it('maps mongoose ValidationError to 400 with collected messages', () => {
    const res = run(named('ValidationError', { errors: { a: { message: 'A bad' }, b: { message: 'B bad' } } }));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false, message: 'Validation error', errors: ['A bad', 'B bad'],
    });
  });

  it('maps CastError to 400', () => {
    const res = run(named('CastError'));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid ID format' });
  });

  it('maps axios-style 404 responses to a job-service 404', () => {
    const res = run(Object.assign(new Error('x'), { response: { status: 404 } }));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false, message: 'Job service not found or job does not exist',
    });
  });

  it('does not treat non-404 upstream responses specially', () => {
    const res = run(Object.assign(new Error('x'), { response: { status: 502 } }));
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('maps "Job not found" errors to 404', () => {
    const res = run(new Error('Job not found'));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Job does not exist' });
  });

  it('falls back to a generic 500 without leaking details', () => {
    const res = run(new Error('secret db password leaked'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Something went wrong!' });
  });
});
