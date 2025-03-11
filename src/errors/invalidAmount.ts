export class InvalidAmountError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Invalid Number Error';
    }
}
