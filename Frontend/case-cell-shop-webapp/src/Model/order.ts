// Same as backend but different in that it is used for the frontend.
export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export interface CreateOrderRequest {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
