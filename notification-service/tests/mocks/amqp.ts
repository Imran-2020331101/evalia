import { vi } from "vitest";

/** Fake amqplib channel/connection capturing consumers so tests can deliver messages. */
export function createFakeBroker() {
  const consumers: Record<string, (msg: any) => void> = {};
  const channel = {
    assertQueue: vi.fn().mockResolvedValue(undefined),
    consume: vi.fn((queue: string, cb: (msg: any) => void) => {
      consumers[queue] = cb;
    }),
    ack: vi.fn(),
  };
  const connection = { createChannel: vi.fn().mockResolvedValue(channel) };
  const deliver = (queue: string, payload: unknown) =>
    consumers[queue]({ content: Buffer.from(JSON.stringify(payload)) });
  return { channel, connection, consumers, deliver };
}
