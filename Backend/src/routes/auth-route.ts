import { FastifyInstance } from "fastify";

import { AuthService } from "../Services/auth-service";

export async function authRoutes(
  app: FastifyInstance,
  authService: AuthService,
) {
  app.post<{
    Body: {
      email: string;
      password: string;
    };
  }>("/auth/login", async (request, reply) => {
    const result = authService.login(request.body);

    return reply.code(200).send({
      success: true,
      data: result,
    });
  });
}
