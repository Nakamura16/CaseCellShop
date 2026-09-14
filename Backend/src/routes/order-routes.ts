import { FastifyInstance } from "fastify";
import { OrderService } from "../Services/order-service";

export async function orderRoutes(
  app: FastifyInstance,
  orderService: OrderService,
) {
  app.post<{
    Body: {
      productId: string;
      quantity: number;
    };
    Headers: {
      "idempotency-key": string;
    };
  }>("/orders", async (request, reply) => {
    const { productId, quantity } = request.body;

    const idempotencyKey = request.headers["idempotency-key"];

    const order = await orderService.createOrder(
      {
        productId,
        quantity,
      },
      idempotencyKey,
    );

    return reply.code(201).send(order);
  });
}
