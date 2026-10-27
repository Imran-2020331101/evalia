import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => {
  const channel = {
    assertExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    publish: vi.fn(),
  };
  const connection = { createChannel: vi.fn(), close: vi.fn() };
  const connect = vi.fn();
  return { channel, connection, connect };
});
vi.mock('amqplib', () => ({ default: { connect: h.connect } }));

import { sendNotification } from '../../../src/utils/notify';

describe('sendNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    h.connect.mockResolvedValue(h.connection);
    h.connection.createChannel.mockResolvedValue(h.channel);
  });
  afterEach(() => vi.useRealTimers());

  it('declares exchange/queue, binds, publishes JSON and closes after 500ms', async () => {
    await sendNotification({ a: 1 }, 'q1');
    expect(h.connect).toHaveBeenCalledWith('amqp://localhost:5672');
    expect(h.channel.assertExchange).toHaveBeenCalledWith('notify', 'direct', { durable: false });
    expect(h.channel.assertQueue).toHaveBeenCalledWith('q1', { durable: true });
    expect(h.channel.bindQueue).toHaveBeenCalledWith('q1', 'notify', 'send-notification');
    const [ex, key, buf] = h.channel.publish.mock.calls[0];
    expect([ex, key]).toEqual(['notify', 'send-notification']);
    expect(JSON.parse(buf.toString())).toEqual({ a: 1 });
    expect(h.connection.close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(h.connection.close).toHaveBeenCalledTimes(1);
  });

  it('swallows connection errors', async () => {
    h.connect.mockRejectedValue(new Error('refused'));
    await expect(sendNotification({}, 'q')).resolves.toBeUndefined();
    expect(h.channel.publish).not.toHaveBeenCalled();
  });
});
