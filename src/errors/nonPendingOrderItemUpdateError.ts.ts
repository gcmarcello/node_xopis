export class NonPendingOrderItemUpdateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Non Pending Order Item Update Error';
    }
}
