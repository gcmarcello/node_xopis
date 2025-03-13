export enum ErrorCodes {
    BAD_REQUEST = "BAD_REQUEST",
    VALIDATION_FAILED = "VALIDATION_FAILED",
  }
  
  export default class ApplicationError extends Error {
    code: string;
    details: any;
  
    constructor(code: ErrorCodes, message: string, details?: any) {
      super(message);
      this.code = code;
      this.details = details;
    }
  }
