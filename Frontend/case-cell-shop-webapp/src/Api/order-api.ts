import { CreateOrderRequest, Order } from "../Model/order";

export class OrderApi {
  private readonly baseUrl = "http://localhost:3000";

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const idempotencyKey = globalThis.crypto.randomUUID();

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const result = await response.json();

      throw new Error(
        result?.error?.message ?? "Não foi possível realizar o pedido.",
      );
    }

    const result: Order = await response.json();

    return result;
  }

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}/orders`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar os pedidos.");
    }

    const result: Order[] = await response.json();

    return result;
  }
}
