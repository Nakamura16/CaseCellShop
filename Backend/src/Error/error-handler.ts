import { FastifyInstance } from "fastify";
import { AppError } from "./AppError";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    request.log.error(error);

    return reply.code(500).send({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
  });
}
