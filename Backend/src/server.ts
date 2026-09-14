import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.get("/", async () => {
  return {
    message: "CaseCellShop API is running!",
  };
});

app.listen({ port: 3000 }, (error, address) => {
  if (error) {
    app.log.error(error);
    process.exit(1);
  }

  console.log(`API running at ${address}`);
});