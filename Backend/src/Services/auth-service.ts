import { randomUUID } from "node:crypto";

import { AuthUser, LoginRequest, LoginResponse } from "../Models/auth";
import { AppError } from "../Error/AppError";

const MOCK_USER = {
  id: "user-1",
  name: "Teste da Silva",
  email: "teste@casecell.com",
  password: "123456",
};

export class AuthService {
  login(request: LoginRequest): LoginResponse {
    if (!request.email || !request.password) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Email and password are required",
        400,
      );
    }

    if (
      request.email !== MOCK_USER.email ||
      request.password !== MOCK_USER.password
    ) {
      throw new AppError(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        401,
      );
    }

    const user: AuthUser = {
      id: MOCK_USER.id,
      name: MOCK_USER.name,
      email: MOCK_USER.email,
    };

    return {
      token: `mock-token-${randomUUID()}`,
      user,
    };
  }
}
