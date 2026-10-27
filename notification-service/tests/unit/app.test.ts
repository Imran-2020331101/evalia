import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";

const broker = vi.hoisted(() => ({ connectBroker: vi.fn() }));
vi.mock("../../src/events/messageBroker", () => broker);
vi.mock("../../src/in-app/service/inapp-notification.service", () => ({
  inAppNotificationService: { getUserNotifications: vi.fn().mockResolvedValue([{ id: 1 }]) },
}));

let app: any;
let connectArgs: any[];
let brokerCalls: number;

beforeAll(async () => {
  const spy = vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose as any);
  app = (await import("../../src/app")).default;
  connectArgs = spy.mock.calls[0];
  brokerCalls = broker.connectBroker.mock.calls.length;
});

describe("app", () => {
  it("connects to mongo and the broker on import", () => {
    expect(connectArgs).toEqual(["mongodb://127.0.0.1:27017/test"]);
    expect(brokerCalls).toBe(1);
  });

  it("mounts notification routes under /api/notifications", async () => {
    const res = await request(app).get("/api/notifications/u1");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: 1 }]);
  });

  it("parses JSON bodies", async () => {
    const res = await request(app).post("/api/notifications/batch-rejection-feedback").send({});
    expect(res.status).toBe(400);
  });

  it("returns a 404 envelope for unknown routes", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.response.message).toBe("Route /nope not found");
  });
});
