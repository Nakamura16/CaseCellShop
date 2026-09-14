export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export interface CreateOrderRequest {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  idempotencyKey: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface OrderItemResponse {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}
