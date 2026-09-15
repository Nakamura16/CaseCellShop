import { Product } from "../Model/product";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class ProductApi {
  private readonly baseUrl = "http://localhost:3000";

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    const result: ApiResponse<Product[]> = await response.json();

    if (!result.success) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    return result.data;
  }
}
