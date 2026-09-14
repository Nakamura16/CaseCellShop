import Fastify from "fastify";
import { createDatabase } from "./Database/database";

const app = Fastify({
  logger: true,
});

async function start() {
  const database = await createDatabase();

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
