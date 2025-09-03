class ApiResponse<T> {
  status: number;
  data: T | null;
  message: string;
  success: boolean;
  timestamp: string;


  constructor(statusCode: number, data: T | null, message: string = "Success") {
    this.status = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300; // true if success status
    this.timestamp = new Date().toString();
  }
}

export { ApiResponse };
