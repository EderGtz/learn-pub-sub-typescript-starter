import type { ConfirmChannel } from "amqplib";

export function publishJSON<T>(
    rabbitChannel: ConfirmChannel,
    exchange: string,
    routingKey: string,
    value: T,
): void {
    const valueJsonBytes = Buffer.from(JSON.stringify(value));
    rabbitChannel.publish(exchange, routingKey, valueJsonBytes, {
        contentType: "application/json"
    });
};