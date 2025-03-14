import ApplicationError, { ErrorCodes } from "./_applicationError";

export class NotFoundError extends ApplicationError {
    constructor(message: string) {
        super(ErrorCodes.NOT_FOUND, message);
        this.name = 'Not Found Error';
    }
}
