import ApplicationError, { ErrorCodes } from "./_applicationError";

export class InvalidAmountError extends ApplicationError {
    constructor(message: string) {
        super(ErrorCodes.BAD_REQUEST, message);
        this.name = 'Invalid Number Error';
    }
}
