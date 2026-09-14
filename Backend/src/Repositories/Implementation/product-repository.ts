import { Database } from "sqlite";
import { Product } from "../../Models/Product";
import { IProductRepository } from "../Interfaces/product-repository";

export class ProductRepository implements IProductRepository {
  constructor(private readonly database: Database) {}

  async getAll(): Promise<Product[]> {
    return this.database.all<Product[]>(
      `
      SELECT
        id,
        name,
        description,
        price,
        stock,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products
      ORDER BY name
      `,
    );
  }

  async findById(id: string): Promise<Product | undefined> {
    return this.database.get<Product>(
      `
      SELECT
        id,
        name,
        description,
        price,
        stock,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products
      WHERE id = ?
      `,
      id,
    );
  }

  async decreaseStock(
    productId: string,
    quantity: number,
    updatedAt: string,
  ): Promise<boolean> {
    const result = await this.database.run(
      `
      UPDATE products
      SET
        stock = stock - ?,
        updated_at = ?
      WHERE id = ?
        AND stock >= ?
      `,
      [quantity, updatedAt, productId, quantity],
    );

    return result.changes === 1;
  }
}
