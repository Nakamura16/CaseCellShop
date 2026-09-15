import Fastify from "fastify";
import cors from "@fastify/cors";

import { createDatabase } from "./Database/database";
import { seedDatabase } from "./Database/seed";

import { ProductService } from "./Services/product-service";
import { ProductRepository } from "./Repositories/Implementation/product-repository";

import { OrderRepository } from "./Repositories/Implementation/order-repository";
import { OrderService } from "./Services/order-service";

import { productRoutes } from "./routes/product-routes";
import { orderRoutes } from "./routes/order-routes";

import { registerErrorHandler } from "./Error/error-handler";
import { AuthService } from "./Services/auth-service";
import { authRoutes } from "./routes/auth-route";

const app = Fastify({
  logger: true,
});

async function start() {
  await app.register(cors, {
    origin: "http://localhost:3001",
  });

  registerErrorHandler(app);

  const database = await createDatabase();
  await seedDatabase(database);

  // Repositories
  const productRepository = new ProductRepository(database);
  const orderRepository = new OrderRepository(database);

  // Services

  const productService = new ProductService(productRepository);

  const orderService = new OrderService(
    database,
    orderRepository,
    productRepository,
  );

  const authService = new AuthService();

  // Routes
  await productRoutes(app, productService);
  await orderRoutes(app, orderService);
  await authRoutes(app, authService);

  app.get("/", async () => {
    return {
      message: "CaseCellShop API is running!",
    };
  });

  await app.listen({
    port: 3000,
  });

  console.log("Database connected");
}

start().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
