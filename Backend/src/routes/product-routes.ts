import { FastifyInstance } from "fastify";
import { ProductService } from "../Services/product-service";
import { AppError } from "../Error/AppError";

export async function productRoutes(
  app: FastifyInstance,
  productService: ProductService,
) {
  app.get("/products", async () => {
    const products = await productService.getAll();

    return {
      success: true,
      data: products,
    };
  });

  app.get<{ Params: { id: string } }>("/products/:id", async (request) => {
    const { id } = request.params;

    const product = await productService.getById(id);

    if (!product) {
      throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
    }

    return {
      success: true,
      data: product,
    };
  });
}
