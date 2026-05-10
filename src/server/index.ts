import amqp from "amqplib";
import { env, exit } from 'node:process';

async function main() {
  console.log("Starting Peril server...");
  const rabbitConnString = env.RABBITMQ_CONNECTION;
  const conn = await amqp.connect(rabbitConnString!);
  console.log("Connection with RabbitMQ successful!");

  ["SIGINT", "SIGTERM"].forEach((signal) =>
    process.on(signal, async () => {
      try {
        await conn.close();
        console.log("RabbitMQ connection closed.");
      } catch (err) {
        console.error("Error closing RabbitMQ connection:", err);
      } finally {
        process.exit(0);
      }
    }),
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
