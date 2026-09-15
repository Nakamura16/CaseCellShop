import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { Database } from "sqlite";

import { OrderService } from "./order-service";

import { IOrderRepository } from "../Repositories/Interfaces/order-repository";
import { IProductRepository } from "../Repositories/Interfaces/product-repository";

import { Product } from "../Models/Product";
import { Order } from "../Models/order";

describe("OrderService", () => {
  let database: Pick<Database, "exec">;

  let orderRepository: Mocked<IOrderRepository>;
  let productRepository: Mocked<IProductRepository>;

  let service: OrderService;

  beforeEach(() => {
    database = {
      exec: vi.fn(),
    };

    orderRepository = {
      findByIdempotencyKey: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      createItem: vi.fn(),
    };

    productRepository = {
      getAll: vi.fn(),
      findById: vi.fn(),
      decreaseStock: vi.fn(),
    };

    service = new OrderService(
      database as Database,
      orderRepository,
      productRepository,
    );
  });

  function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
      id: "iphone-15",
      name: "Capinha iPhone 15",
      description: "Capinha de silicone",
      price: 49.9,
      stock: 10,
      createdAt: "2026-09-15T10:00:00.000Z",
      updatedAt: "2026-09-15T10:00:00.000Z",
      ...overrides,
    };
  }

  function makeOrder(overrides: Partial<Order> = {}): Order {
    return {
      id: "order-123",
      idempotencyKey: "idempotency-123",
      status: "CONFIRMED",
      totalAmount: 49.9,
      createdAt: "2026-09-15T10:00:00.000Z",
      updatedAt: "2026-09-15T10:00:00.000Z",
      ...overrides,
    };
  }

  describe("createOrder", () => {
    describe("Simple - happy path", () => {
      it("should create a confirmed order", async () => {
        // Arrange
        const product = makeProduct({
          price: 49.9,
          stock: 10,
        });

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(true);

        // Act
        const result = await service.createOrder(
          {
            productId: product.id,
            quantity: 1,
          },
          "idempotency-123",
        );

        // Assert
        expect(result.status).toBe("CONFIRMED");
        expect(result.totalAmount).toBe(49.9);
        expect(result.idempotencyKey).toBe("idempotency-123");
      });
    });

    describe("Zero", () => {
      it.each([0, -1, -10])(
        "should reject quantity %s",
        async (quantity: number) => {
          // Arrange
          const request = {
            productId: "iphone-15",
            quantity,
          };

          // Act
          const promise = service.createOrder(request, "idempotency-123");

          // Assert
          await expect(promise).rejects.toMatchObject({
            code: "VALIDATION_ERROR",
            statusCode: 400,
          });

          expect(database.exec).not.toHaveBeenCalled();

          expect(productRepository.findById).not.toHaveBeenCalled();
        },
      );

      it("should reject an empty product id", async () => {
        // Arrange
        const request = {
          productId: "",
          quantity: 1,
        };

        // Act
        const promise = service.createOrder(request, "idempotency-123");

        // Assert
        await expect(promise).rejects.toMatchObject({
          code: "VALIDATION_ERROR",
          statusCode: 400,
        });

        expect(productRepository.findById).not.toHaveBeenCalled();
      });

      it("should reject a missing idempotency key", async () => {
        // Arrange
        const request = {
          productId: "iphone-15",
          quantity: 1,
        };

        // Act
        const promise = service.createOrder(request, "");

        // Assert
        await expect(promise).rejects.toMatchObject({
          code: "VALIDATION_ERROR",
          statusCode: 400,
        });

        expect(database.exec).not.toHaveBeenCalled();
      });
    });

    describe("One", () => {
      it("should create an order with one item", async () => {
        // Arrange
        const product = makeProduct({
          price: 59.9,
          stock: 10,
        });

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(true);

        // Act
        const result = await service.createOrder(
          {
            productId: product.id,
            quantity: 1,
          },
          "key-one",
        );

        // Assert
        expect(result.totalAmount).toBe(59.9);

        expect(productRepository.decreaseStock).toHaveBeenCalledWith(
          product.id,
          1,
          expect.any(String),
        );

        expect(orderRepository.createItem).toHaveBeenCalledWith(
          expect.objectContaining({
            productId: product.id,
            quantity: 1,
            unitPrice: 59.9,
          }),
        );
      });
    });

    describe("Many", () => {
      it("should correctly calculate the total for multiple units", async () => {
        // Arrange
        const product = makeProduct({
          price: 49.9,
          stock: 10,
        });

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(true);

        // Act
        const result = await service.createOrder(
          {
            productId: product.id,
            quantity: 5,
          },
          "key-many",
        );

        // Assert
        expect(result.totalAmount).toBe(249.5);

        expect(productRepository.decreaseStock).toHaveBeenCalledWith(
          product.id,
          5,
          expect.any(String),
        );
      });
    });

    describe("Boundary", () => {
      it("should allow purchasing exactly the available stock", async () => {
        // Arrange
        const product = makeProduct({
          stock: 5,
          price: 50,
        });

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(true);

        // Act
        const result = await service.createOrder(
          {
            productId: product.id,
            quantity: 5,
          },
          "key-boundary",
        );

        // Assert
        expect(result.status).toBe("CONFIRMED");
        expect(result.totalAmount).toBe(250);

        expect(productRepository.decreaseStock).toHaveBeenCalledWith(
          product.id,
          5,
          expect.any(String),
        );
      });

      it("should reject purchasing one unit above available stock", async () => {
        // Arrange
        const product = makeProduct({
          stock: 5,
        });

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(false);

        // Act
        const promise = service.createOrder(
          {
            productId: product.id,
            quantity: 6,
          },
          "key-boundary",
        );

        // Assert
        await expect(promise).rejects.toMatchObject({
          code: "INSUFFICIENT_STOCK",
          statusCode: 409,
        });

        expect(orderRepository.create).not.toHaveBeenCalled();

        expect(orderRepository.createItem).not.toHaveBeenCalled();
      });

      it("should reject fractional quantities", async () => {
        // Arrange
        const request = {
          productId: "iphone-15",
          quantity: 1.5,
        };

        // Act
        const promise = service.createOrder(request, "key-fractional");

        // Assert
        await expect(promise).rejects.toMatchObject({
          code: "VALIDATION_ERROR",
          statusCode: 400,
        });
      });
    });

    describe("Interface", () => {
      it("should execute the transaction before accessing the order", async () => {
        // Arrange
        const product = makeProduct();

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(true);

        // Act
        await service.createOrder(
          {
            productId: product.id,
            quantity: 1,
          },
          "key-interface",
        );

        // Assert
        expect(database.exec).toHaveBeenNthCalledWith(1, "BEGIN IMMEDIATE");

        expect(orderRepository.findByIdempotencyKey).toHaveBeenCalledWith(
          "key-interface",
        );
      });

      it("should persist the order and its item", async () => {
        // Arrange
        const product = makeProduct({
          price: 100,
        });

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(true);

        // Act
        await service.createOrder(
          {
            productId: product.id,
            quantity: 2,
          },
          "key-interface",
        );

        // Assert
        expect(orderRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "CONFIRMED",
            totalAmount: 200,
            idempotencyKey: "key-interface",
          }),
        );

        expect(orderRepository.createItem).toHaveBeenCalledWith(
          expect.objectContaining({
            quantity: 2,
            unitPrice: 100,
          }),
        );
      });

      it("should commit after successfully persisting the order", async () => {
        // Arrange
        const product = makeProduct();

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(true);

        // Act
        await service.createOrder(
          {
            productId: product.id,
            quantity: 1,
          },
          "key-commit",
        );

        // Assert
        expect(database.exec).toHaveBeenLastCalledWith("COMMIT");
      });
    });

    describe("Exceptional", () => {
      it("should reject when the product does not exist", async () => {
        // Arrange
        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(undefined);

        // Act
        const promise = service.createOrder(
          {
            productId: "does-not-exist",
            quantity: 1,
          },
          "key-not-found",
        );

        // Assert
        await expect(promise).rejects.toMatchObject({
          code: "PRODUCT_NOT_FOUND",
          statusCode: 404,
        });

        expect(database.exec).toHaveBeenLastCalledWith("ROLLBACK");

        expect(orderRepository.create).not.toHaveBeenCalled();
      });

      it("should reject when stock cannot be decreased", async () => {
        // Arrange
        const product = makeProduct({
          stock: 1,
        });

        orderRepository.findByIdempotencyKey.mockResolvedValue(undefined);

        productRepository.findById.mockResolvedValue(product);

        productRepository.decreaseStock.mockResolvedValue(false);

        // Act
        const promise = service.createOrder(
          {
            productId: product.id,
            quantity: 2,
          },
          "key-stock",
        );

        // Assert
        await expect(promise).rejects.toMatchObject({
          code: "INSUFFICIENT_STOCK",
          statusCode: 409,
        });

        expect(database.exec).toHaveBeenLastCalledWith("ROLLBACK");
      });

      it("should rollback when an unexpected repository error occurs", async () => {
        // Arrange
        const databaseError = new Error("Database unavailable");

        orderRepository.findByIdempotencyKey.mockRejectedValue(databaseError);

        // Act
        const promise = service.createOrder(
          {
            productId: "iphone-15",
            quantity: 1,
          },
          "key-error",
        );

        // Assert
        await expect(promise).rejects.toThrow("Database unavailable");

        expect(database.exec).toHaveBeenNthCalledWith(1, "BEGIN IMMEDIATE");

        expect(database.exec).toHaveBeenLastCalledWith("ROLLBACK");
      });
    });

    describe("Idempotency", () => {
      it("should return the existing order when the idempotency key already exists", async () => {
        // Arrange
        const existingOrder = makeOrder();

        orderRepository.findByIdempotencyKey.mockResolvedValue(existingOrder);

        // Act
        const result = await service.createOrder(
          {
            productId: "iphone-15",
            quantity: 1,
          },
          "idempotency-123",
        );

        // Assert
        expect(result).toEqual(existingOrder);

        expect(productRepository.findById).not.toHaveBeenCalled();

        expect(productRepository.decreaseStock).not.toHaveBeenCalled();

        expect(orderRepository.create).not.toHaveBeenCalled();

        expect(orderRepository.createItem).not.toHaveBeenCalled();

        expect(database.exec).toHaveBeenLastCalledWith("COMMIT");
      });
    });
  });

  describe("getAllOrders", () => {
    it("should return all orders from the repository", async () => {
      // Arrange
      const orders = [
        makeOrder({
          id: "order-1",
          idempotencyKey: "key-1",
          totalAmount: 49.9,
        }),
        makeOrder({
          id: "order-2",
          idempotencyKey: "key-2",
          totalAmount: 99.8,
        }),
      ];

      orderRepository.getAll.mockResolvedValue(orders);

      // Act
      const result = await service.getAllOrders();

      // Assert
      expect(result).toEqual(orders);

      expect(orderRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
