import amqp from "amqplib";
import { env, exit } from 'node:process';
import { publishJSON } from "../internal/pubsub/publish.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";

async function main() {
  console.log("Starting Peril server...");
  const rabbitConnString = env.RABBITMQ_CONNECTION;
  const conn = await amqp.connect(rabbitConnString!);
  console.log("Connection with RabbitMQ successful!");

  const rabbitChannel = await conn.createConfirmChannel();
  const value: PlayingState = { isPaused: true };

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

    printServerHelp();

  while (true) {
      const option = await getInput();
      if (option.length === 0) continue;
      let gameState: PlayingState = { isPaused: false };

      switch (option[0]) {
        case "pause":
          console.log("Pausing the game");
          gameState.isPaused = true;
          try {
            publishJSON(rabbitChannel, ExchangePerilDirect, PauseKey, gameState);
          } catch (err) {
            console.error("Error publishing pause message:", err);
          };
          break;
        case "resume":
          console.log("Resuming the game");
          gameState.isPaused = false;
          try {
            publishJSON( rabbitChannel, ExchangePerilDirect, PauseKey, gameState);
          } catch (err) {
            console.error("Error publishing resume message:", err);
          };
          
          break;
        case "quit":
          console.log("Exiting the game");
          process.exit(0);
        default:
          console.log("Unknown command.")
      }  
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
