import Fastify from "fastify";
import { createDatabase } from "./Database/database";
import { seedDatabase } from "./Database/seed";

const app = Fastify({
  logger: true,
});

async function start() {
  const database = await createDatabase();
  await seedDatabase(database);

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
