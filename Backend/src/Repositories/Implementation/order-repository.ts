import { Database } from "sqlite";
import { Order, OrderItem } from "../../Models/order";
import { IOrderRepository } from "../Interfaces/order-repository";

export class OrderRepository implements IOrderRepository {
  constructor(private readonly database: Database) {}

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Order | undefined> {
    return this.database.get<Order>(
      `
      SELECT
        id,
        idempotency_key AS idempotencyKey,
        status,
        total_amount AS totalAmount,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM orders
      WHERE idempotency_key = ?
      `,
      idempotencyKey,
    );
  }

  async create(order: Order): Promise<void> {
    await this.database.run(
      `
      INSERT INTO orders (
        id,
        idempotency_key,
        status,
        total_amount,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        order.id,
        order.idempotencyKey,
        order.status,
        order.totalAmount,
        order.createdAt,
        order.updatedAt,
      ],
    );
  }

  async createItem(item: OrderItem): Promise<void> {
    await this.database.run(
      `
      INSERT INTO order_items (
        id,
        order_id,
        product_id,
        quantity,
        unit_price
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [item.id, item.orderId, item.productId, item.quantity, item.unitPrice],
    );
  }
}
