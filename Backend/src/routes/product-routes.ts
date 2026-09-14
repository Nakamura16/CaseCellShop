import { FastifyInstance } from "fastify";
import { ProductService } from "../Services/product-service";

export async function productRoutes(
  app: FastifyInstance,
  productService: ProductService,
) {
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
}
