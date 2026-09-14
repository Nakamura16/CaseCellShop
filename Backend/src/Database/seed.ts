import { Database } from "sqlite";

const products = [
  {
    id: "iphone-15",
    name: "Capinha iPhone 15",
    description: "Capinha de silicone para iPhone 15",
    price: 49.9,
    stock: 10,
  },
  {
    id: "iphone-15-pro",
    name: "Capinha iPhone 15 Pro",
    description: "Capinha de silicone para iPhone 15 Pro",
    price: 59.9,
    stock: 8,
  },
  {
    id: "iphone-16",
    name: "Capinha iPhone 16",
    description: "Capinha de silicone para iPhone 16",
    price: 69.9,
    stock: 5,
  },
  {
    id: "galaxy-s24",
    name: "Capinha Galaxy S24",
    description: "Capinha de silicone para Galaxy S24",
    price: 44.9,
    stock: 7,
  },
  {
    id: "galaxy-s25",
    name: "Capinha Galaxy S25",
    description: "Capinha de silicone para Galaxy S25",
    price: 54.9,
    stock: 3,
  },
  {
    id: "pixel-9",
    name: "Capinha Pixel 9",
    description: "Capinha de silicone para Pixel 9",
    price: 64.9,
    stock: 2,
  },
];

export async function seedDatabase(database: Database): Promise<void> {
  for (const product of products) {
    const now = new Date().toISOString();

    await database.run(
      `
      INSERT OR IGNORE INTO products (
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.stock,
        now,
        now,
      ],
    );
  }
}
