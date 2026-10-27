import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({
  channel: {
    assertExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    publish: vi.fn(),
  },
  connection: { createChannel: vi.fn(), close: vi.fn() },
  connect: vi.fn(),
}));

vi.mock('amqplib', () => ({ default: { connect: h.connect } }));

import { sendNotification } from '../../../src/utils/notify';

describe('sendNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    h.connect.mockResolvedValue(h.connection);
    h.connection.createChannel.mockResolvedValue(h.channel);
  });
  afterEach(() => vi.useRealTimers());

  it('declares exchange/queue, binds, publishes the JSON message and closes after 500ms', async () => {
    const msg = { type: 'x', n: 1 };
    await sendNotification(msg, 'notifications');

    expect(h.connect).toHaveBeenCalledWith('amqp://test-host');
    expect(h.channel.assertExchange).toHaveBeenCalledWith('notify', 'direct', { durable: false });
    expect(h.channel.assertQueue).toHaveBeenCalledWith('notifications', { durable: true });
    expect(h.channel.bindQueue).toHaveBeenCalledWith('notifications', 'notify', 'send-notification');
    expect(h.channel.publish).toHaveBeenCalledWith('notify', 'send-notification', Buffer.from(JSON.stringify(msg)));

    expect(h.connection.close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(h.connection.close).toHaveBeenCalledOnce();
  });

  it('swallows connection errors and logs them', async () => {
    const err = new Error('refused');
    h.connect.mockRejectedValue(err);
    await expect(sendNotification({}, 'q')).resolves.toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(err);
    expect(h.channel.publish).not.toHaveBeenCalled();
  });

  it('swallows channel errors', async () => {
    h.connection.createChannel.mockRejectedValue(new Error('chan'));
    await expect(sendNotification({}, 'q')).resolves.toBeUndefined();
    expect(h.connection.close).not.toHaveBeenCalled();
  });
});
