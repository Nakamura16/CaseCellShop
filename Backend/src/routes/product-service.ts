import { Database } from "sqlite";

export class ProductService {
  constructor(private readonly database: Database) {}

  async getAll() {
    return this.database.all(`
      SELECT *
      FROM products
      ORDER BY name
    `);
  }

  async getById(id: string) {
    const query = `
        SELECT *
        FROM products
        WHERE id = ?
    `;

    return this.database.get(query, id);
  }
}
