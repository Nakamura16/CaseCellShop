import { Product } from "../../Models/Product";

export interface IProductRepository {
  getAll(): Promise<Product[]>;

  findById(id: string): Promise<Product | undefined>;

  decreaseStock(
    productId: string,
    quantity: number,
    updatedAt: string,
  ): Promise<boolean>;
}
