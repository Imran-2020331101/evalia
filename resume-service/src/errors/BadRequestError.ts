import { CustomApiError } from './CustomApiError';

export class BadRequestError extends CustomApiError {
  constructor(message: string, errors: string[] = []) {
    super(message, 400, errors);
    this.name = 'BadRequestError';
  }
}
