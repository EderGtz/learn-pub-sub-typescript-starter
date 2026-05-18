import amqp from "amqplib";
import { env } from "node:process";
import { clientWelcome } from "../internal/gamelogic/gamelogic.js";
import { declareAndBindQueue, SimpleQueueType } from "../internal/pubsub/queue.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";

async function main() {
  console.log("Starting Peril client...");
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

  const username = await clientWelcome();
  await declareAndBindQueue(
    conn, 
    ExchangePerilDirect, 
    `pause.${username}`, 
    PauseKey, 
    SimpleQueueType.Transient
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
