import amqp, { type Channel } from "amqplib";

export enum SimpleQueueType {
    Durable,
    Transient
};

export async function declareAndBindQueue(
    connection: amqp.ChannelModel,
    exchange: string,
    queueName: string,
    key: string,
    queueType: SimpleQueueType
): Promise<[Channel, amqp.Replies.AssertQueue]> {
    
    const channel = await connection.createChannel();
    const newQueue = await channel.assertQueue(queueName, {
        durable: queueType === SimpleQueueType.Durable,
        autoDelete: queueType !== SimpleQueueType.Durable,
        exclusive: queueType !== SimpleQueueType.Durable
    }); 
    await channel.bindQueue(newQueue.queue, exchange, key);
    return [channel, newQueue];
};