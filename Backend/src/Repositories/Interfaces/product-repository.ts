import { Product } from "../../Models/Product";

export interface IProductRepository {
  findById(id: string): Promise<Product | undefined>;

  decreaseStock(
    productId: string,
    quantity: number,
    updatedAt: string,
  ): Promise<boolean>;
}
