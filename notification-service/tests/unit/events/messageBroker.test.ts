import { describe, it, expect, vi } from "vitest";
import { createFakeBroker } from "../../mocks/amqp";

const m = vi.hoisted(() => ({
  connect: vi.fn(),
  inApp: vi.fn(),
  mail: vi.fn(),
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));
vi.mock("amqplib", () => ({ default: { connect: m.connect } }));
vi.mock("../../../src/in-app/handlers/inapp-notification.handler", () => ({ handleInAppNotifications: m.inApp }));
vi.mock("../../../src/mail/handlers/mail-notification.handler", () => ({ handleIncomingMailEvent: m.mail }));
vi.mock("../../../src/utils/logger", () => ({ default: m.logger }));

import { connectBroker } from "../../../src/events/messageBroker";

describe("connectBroker", () => {
  it("asserts durable queues and logs readiness", async () => {
    const b = createFakeBroker();
    m.connect.mockResolvedValue(b.connection);
    await connectBroker();
    expect(m.connect).toHaveBeenCalledWith("amqp://localhost:5672");
    expect(b.channel.assertQueue).toHaveBeenCalledWith("notifications", { durable: true });
    expect(b.channel.assertQueue).toHaveBeenCalledWith("email-notification", { durable: true });
    expect(b.channel.consume).toHaveBeenCalledTimes(2);
    expect(m.logger.info).toHaveBeenCalledWith("Connected to message broker and listening...");
  });

  it("routes 'notifications' messages to the in-app handler and acks", async () => {
    const b = createFakeBroker();
    m.connect.mockResolvedValue(b.connection);
    await connectBroker();
    b.deliver("notifications", { type: "x", a: 1 });
    expect(m.inApp).toHaveBeenCalledWith({ type: "x", a: 1 });
    expect(m.mail).not.toHaveBeenCalled();
    expect(b.channel.ack).toHaveBeenCalledTimes(1);
  });

  it("routes 'email-notification' messages to the mail handler and acks", async () => {
    const b = createFakeBroker();
    m.connect.mockResolvedValue(b.connection);
    await connectBroker();
    b.deliver("email-notification", { type: "y" });
    expect(m.mail).toHaveBeenCalledWith({ type: "y" });
    expect(m.inApp).not.toHaveBeenCalled();
    expect(b.channel.ack).toHaveBeenCalledTimes(1);
  });

  it("ignores null messages (consumer cancelled)", async () => {
    const b = createFakeBroker();
    m.connect.mockResolvedValue(b.connection);
    await connectBroker();
    b.consumers["notifications"](null);
    b.consumers["email-notification"](null);
    expect(m.inApp).not.toHaveBeenCalled();
    expect(m.mail).not.toHaveBeenCalled();
    expect(b.channel.ack).not.toHaveBeenCalled();
  });

  it("logs instead of throwing when the broker is unreachable", async () => {
    const err = new Error("ECONNREFUSED");
    m.connect.mockRejectedValue(err);
    await expect(connectBroker()).resolves.toBeUndefined();
    expect(m.logger.error).toHaveBeenCalledWith("Message broker connection failed", err);
  });
});
