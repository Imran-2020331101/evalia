import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import { buildTestApp } from "../helpers/testApp";
import { asyncHandler } from "../../src/utils/asyncHandler";
import { NotificationNotFoundError, RateLimitExceededError } from "../../src/utils";

const app = buildTestApp((a) => {
  a.get("/t/custom", asyncHandler(async () => { throw new NotificationNotFoundError("42"); }));
  a.get("/t/rate", (_q, _r, next) => next(new RateLimitExceededError("send", 5, "min")));
  a.get("/t/plain", asyncHandler(async () => { throw new Error("plain"); }));
  a.get("/t/status", (_q, _r, next) => next(Object.assign(new Error("teapot"), { statusCode: 418 })));
  a.get("/t/sync", () => { throw new Error("sync boom"); });
});

afterEach(() => { process.env.NODE_ENV = "test"; });

describe("error handling pipeline", () => {
  it("maps custom ApiErrors to their status + message", async () => {
    const res = await request(app).get("/t/custom");
    expect(res.status).toBe(404);
    expect(res.body.response).toMatchObject({ status: 404, message: "Notification with ID 42 not found", data: null, success: false });
  });

  it("maps 429", async () => {
    expect((await request(app).get("/t/rate")).status).toBe(429);
  });

  it("converts plain errors to 500", async () => {
    const res = await request(app).get("/t/plain");
    expect(res.status).toBe(500);
    expect(res.body.response.message).toBe("plain");
  });

  it("respects statusCode on foreign errors", async () => {
    expect((await request(app).get("/t/status")).status).toBe(418);
  });

  it("handles synchronous throws (express 5)", async () => {
    const res = await request(app).get("/t/sync");
    expect(res.status).toBe(500);
    expect(res.body.response.message).toBe("sync boom");
  });

  it("returns 404 with the requested URL for unknown routes", async () => {
    const res = await request(app).get("/does/not/exist?x=1");
    expect(res.status).toBe(404);
    expect(res.body.response.message).toBe("Route /does/not/exist?x=1 not found");
  });

  it("exposes stack only in development", async () => {
    expect((await request(app).get("/t/plain")).body.stack).toBeUndefined();
    process.env.NODE_ENV = "development";
    expect((await request(app).get("/t/plain")).body.stack).toContain("plain");
  });

  it("rejects malformed JSON bodies with a 400", async () => {
    const res = await request(app).post("/api/notifications/batch-rejection-feedback")
      .set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
  });
});
