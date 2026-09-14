import { Order, OrderItem } from "../../Models/order";

export interface IOrderRepository {
  findByIdempotencyKey(idempotencyKey: string): Promise<Order | undefined>;

  create(order: Order): Promise<void>;

  createItem(item: OrderItem): Promise<void>;
}
