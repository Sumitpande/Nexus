import { Kafka, Producer, Consumer, logLevel } from "kafkajs";

let kafka: Kafka | null = null;
let producer: Producer | null = null;

/**
 * Initialize the Kafka client. Reads KAFKA_BROKERS from the environment.
 * Call this once at service startup before using getProducer/getConsumer.
 */
export async function connectKafka(): Promise<Kafka> {
  if (!kafka) {
    const brokers = (process.env.KAFKA_BROKERS || "kafka:9092").split(",");

    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || "nexus-service",
      brokers,
      logLevel: logLevel.INFO,
    });

    console.info("➡️  Kafka client initialized:", brokers);
  }

  return kafka;
}

/**
 * Get a singleton Kafka producer. Connects lazily on first call.
 */
export async function getProducer(): Promise<Producer> {
  if (!producer) {
    const client = await connectKafka();
    producer = client.producer();
    await producer.connect();
    console.info("➡️  Kafka producer connected");
  }
  return producer;
}

/**
 * Create a new Kafka consumer with the given group ID.
 * Each service should use its own consumer group for independent processing.
 */
export async function getConsumer(groupId: string): Promise<Consumer> {
  const client = await connectKafka();
  const consumer = client.consumer({ groupId });
  await consumer.connect();
  console.info(`➡️  Kafka consumer connected (group: ${groupId})`);
  return consumer;
}

/**
 * Graceful shutdown: disconnect producer and kafka client.
 */
export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
  kafka = null;
  console.info("➡️  Kafka disconnected");
}
