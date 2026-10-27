import { describe, it, expect, vi } from "vitest";
import { createFakeBroker } from "../mocks/amqp";
import { fakeDoc } from "../helpers/testDb";
import { rejectionPayload } from "../fixtures/payloads";

const m = vi.hoisted(() => ({ connect: vi.fn(), sendMail: vi.fn(), create: vi.fn() }));
vi.mock("amqplib", () => ({ default: { connect: m.connect } }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: m.sendMail, verify: vi.fn() }) } }));
vi.mock("../../src/in-app/model/inapp-notification", () => ({ Notification: { create: m.create } }));
vi.mock("../../src/config/socket", () => ({
  io: { to: () => ({ emit: vi.fn() }) }, notifyUser: vi.fn(), notifyInterviewUpdate: vi.fn(),
}));

import { connectBroker } from "../../src/events/messageBroker";

describe("broker -> handlers -> side effects", () => {
  it("a message on 'notifications' creates an in-app notification", async () => {
    const b = createFakeBroker();
    m.connect.mockResolvedValue(b.connection);
    m.create.mockImplementation(async (d: any) => ({ ...fakeDoc(), ...d }));
    await connectBroker();

    b.deliver("notifications", { type: "subscription.expired", recieverEmail: "u@t.c" });
    await vi.waitFor(() => expect(m.create).toHaveBeenCalled());
    expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ title: "Subscription Expired ", recieverEmail: "u@t.c" }));
    expect(b.channel.ack).toHaveBeenCalledTimes(1);
  });

  it("a message on 'email-notification' sends an e-mail", async () => {
    const b = createFakeBroker();
    m.connect.mockResolvedValue(b.connection);
    m.sendMail.mockResolvedValue({ messageId: "1" });
    await connectBroker();

    b.deliver("email-notification", rejectionPayload());
    await vi.waitFor(() => expect(m.sendMail).toHaveBeenCalled());
    expect(m.sendMail.mock.calls[0][0].to).toBe("alice@test.com");
    expect(b.channel.ack).toHaveBeenCalledTimes(1);
  });

  it("an unreachable broker is tolerated", async () => {
    m.connect.mockRejectedValue(new Error("down"));
    await expect(connectBroker()).resolves.toBeUndefined();
  });
});
