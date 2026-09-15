import { CreateOrderRequest, Order } from "../Model/order";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class OrderApi {
  private readonly baseUrl = "http://localhost:3000";

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const idempotencyKey = crypto.randomUUID();

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(request),
    });

    const result: ApiResponse<Order> = await response.json();

    if (!response.ok || !result.success) {
      if (!result.success) {
        throw new Error(result.error.message);
      }

      throw new Error("Não foi possível realizar a compra.");
    }

    return result.data;
  }
}
