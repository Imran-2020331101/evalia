export class CustomApiError extends Error {
  public statusCode: number;
  public data: any;
  public success: boolean;
  public errors: string[];

  constructor(
    message: string, 
    statusCode: number = 500,
    errors: string[] = [],
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
    this.name = 'CustomApiError';
    
    if (stack) {
      this.stack = stack;
    } else if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, CustomApiError);
    }
  }
}
