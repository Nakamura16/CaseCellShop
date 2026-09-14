import Fastify from "fastify";
import { createDatabase } from "./Database/database";
import { seedDatabase } from "./Database/seed";
import { ProductService } from "./routes/product-service";

const app = Fastify({
  logger: true,
});

async function start() {
  const database = await createDatabase();
  await seedDatabase(database);

  const productService = new ProductService(database);

  app.get("/", async () => {
    return {
      message: "CaseCellShop API is running!",
    };
  });

  app.get("/products", async () => {
    return productService.getAll();
  });

  app.get<{ Params: { id: string } }>(
    "/products/:id",
    async (request, reply) => {
      const { id } = request.params;

      const product = await productService.getById(id);

      if (!product) {
        return reply.code(404).send({
          message: "Product not found",
        });
      }

      return product;
    },
  );

  await app.listen({
    port: 3000,
  });

  console.log("Database connected");
}

start().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
