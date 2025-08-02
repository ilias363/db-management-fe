export class HttpError extends Error {
  readonly statusCode: number;
  constructor(statusCode: number, message?: string) {
    if (statusCode < 100 || statusCode > 599) {
      throw new Error(`Invalid HTTP status code: ${statusCode}`);
    }
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}