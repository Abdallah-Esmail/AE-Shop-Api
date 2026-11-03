class appError extends Error {
  statusCode: number;
  statusText: string;
  constructor(message: string, statusCode: number, statusText: string) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

export default appError;
