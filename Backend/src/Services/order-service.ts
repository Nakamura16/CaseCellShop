import { randomUUID } from "node:crypto";
import { Database } from "sqlite";
import { CreateOrderRequest, Order, OrderItem } from "../Models/order";
import { OrderRepository } from "../Repositories/Implementation/order-repository";
import { ProductRepository } from "../Repositories/Implementation/product-repository";
import { AppError } from "../Error/AppError";

export class OrderService {
  constructor(
    private readonly database: Database,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async createOrder(
    request: CreateOrderRequest,
    idempotencyKey: string,
  ): Promise<Order> {
    this.validateRequest(request, idempotencyKey);

    await this.database.exec("BEGIN IMMEDIATE");

    try {
      const existingOrder =
        await this.orderRepository.findByIdempotencyKey(idempotencyKey);

      if (existingOrder) {
        await this.database.exec("COMMIT");
        return existingOrder;
      }

      const product = await this.productRepository.findById(request.productId);

      if (!product) {
        throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
      }

      const updatedAt = new Date().toISOString();

      const stockUpdated = await this.productRepository.decreaseStock(
        product.id,
        request.quantity,
        updatedAt,
      );

      if (!stockUpdated) {
        throw new AppError("INSUFFICIENT_STOCK", "Insufficient stock", 409);
      }

      const order = this.createOrderEntity(
        request,
        idempotencyKey,
        product.price,
        updatedAt,
      );

      const orderItem = this.createOrderItem(
        order,
        product.id,
        request.quantity,
        product.price,
      );

      await this.orderRepository.create(order);
      await this.orderRepository.createItem(orderItem);

      await this.database.exec("COMMIT");

      return order;
    } catch (error) {
      await this.database.exec("ROLLBACK");
      throw error;
    }
  }

  private validateRequest(
    request: CreateOrderRequest,
    idempotencyKey: string,
  ): void {
    if (!request.productId) {
      throw new AppError("VALIDATION_ERROR", "ProductId is required", 400);
    }

    if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Quantity must be a positive integer",
        400,
      );
    }

    if (!idempotencyKey) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Idempotency-Key is required",
        400,
      );
    }
  }

  private createOrderEntity(
    request: CreateOrderRequest,
    idempotencyKey: string,
    unitPrice: number,
    timestamp: string,
  ): Order {
    return {
      id: randomUUID(),
      idempotencyKey,
      status: "CONFIRMED",
      totalAmount: unitPrice * request.quantity,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  private createOrderItem(
    order: Order,
    productId: string,
    quantity: number,
    unitPrice: number,
  ): OrderItem {
    return {
      id: randomUUID(),
      orderId: order.id,
      productId,
      quantity,
      unitPrice,
    };
  }
}
