import { AuthUser } from "../Model/auth";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface ApiSuccess {
  success: true;
  data: LoginResponse;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse = ApiSuccess | ApiError;

export interface LoginRequest {
  email: string;
  password: string;
}

export class AuthApi {
  private readonly baseUrl = "http://localhost:3000";

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success) {
      if (!result.success) {
        throw new Error(result.error.message);
      }

      throw new Error("Não foi possível realizar o login.");
    }

    return result.data;
  }
}
