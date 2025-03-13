import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from "fastify-type-provider-zod";
import ApplicationError, { ErrorCodes } from "src/errors/_applicationError";

export const errorHandler = (
    error: FastifyError,
    _req: FastifyRequest,
    reply: FastifyReply
) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.code(400).send({
            error: "Bad Request",
            message: "Validation failed",
            details: error.validation.map((error: any) => ({
                field: error.params.issue.path.join(".") ?? undefined,
                message: error.params.issue.message,
            }))
        });
    }

    if (isResponseSerializationError(error)) {
        return reply.code(500).send(new ApplicationError(ErrorCodes.VALIDATION_FAILED, error.message, error.validation));
    }

    if (error instanceof ApplicationError) {
        if (error.code === ErrorCodes.BAD_REQUEST) {
            return reply.code(400).send({
                error: "Bad Request",
                message: error.message,
            });
        }
    }

    return reply.status(500).send({
        error: "Internal Server Error",
        message: "Internal Server Error",
        details: {
            error: error.message,
            stack: error.stack,
        }
    });
};
