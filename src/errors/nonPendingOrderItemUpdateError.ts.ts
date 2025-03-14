import ApplicationError, { ErrorCodes } from "./_applicationError";

export class NonPendingOrderItemUpdateError extends ApplicationError {
    constructor(message: string) {
        super(ErrorCodes.BAD_REQUEST, message);
        this.name = 'Non Pending Order Item Update Error';
    }
}
