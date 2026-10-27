import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { batchBody } from "../../fixtures/payloads";

const m = vi.hoisted(() => ({ handle: vi.fn() }));
vi.mock("../../../src/in-app/handlers/inapp-notification.handler", () => ({ handleInAppNotifications: m.handle }));
vi.mock("../../../src/controllers", () => ({
  notificationController: {
    fetchNotificationsOfAUser: (_q: any, r: any) => r.json({ route: "fetch" }),
    readNotification: (_q: any, r: any) => r.json({ route: "read" }),
    readAllNotification: (_q: any, r: any) => r.json({ route: "readAll" }),
    deleteNotification: (_q: any, r: any) => r.json({ route: "delete" }),
  },
}));
vi.mock("../../../src/in-app/service/inapp-notification.service", () => ({ inAppNotificationService: {} }));

import { buildTestApp } from "../../helpers/testApp";
const app = buildTestApp();

describe("notificationRoutes wiring", () => {
  it.each([
    ["get", "/api/notifications/u1", "fetch"],
    ["put", "/api/notifications/n1/read", "read"],
    ["put", "/api/notifications/u1/read-all", "readAll"],
    ["delete", "/api/notifications/n1", "delete"],
  ])("%s %s -> %s", async (method, url, route) => {
    const res = await (request(app) as any)[method](url);
    expect(res.body).toEqual({ route });
  });
});

describe("POST /batch-rejection-feedback", () => {
  const post = (b: any) => request(app).post("/api/notifications/batch-rejection-feedback").send(b);

  it("triggers the handler and reports candidates to process", async () => {
    m.handle.mockResolvedValue(undefined);
    const res = await post(batchBody());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, jobId: "j1", candidatesToProcess: 2 });
    expect(m.handle).toHaveBeenCalledWith(expect.objectContaining({
      type: "batch.rejection.feedback", jobId: "j1", recruiterId: "rec1", timestamp: expect.any(String),
    }));
  });

  it.each(["jobId", "jobTitle", "companyName", "shortlistedCandidates", "allApplicants", "recruiterId"])(
    "400 when %s is missing", async (field) => {
      const b: any = batchBody(); delete b[field];
      const res = await post(b);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing required fields/);
      expect(m.handle).not.toHaveBeenCalled();
    });

  it("400 when shortlistedCandidates is not an array", async () => {
    const res = await post(batchBody({ shortlistedCandidates: "u1" }));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("shortlistedCandidates must be an array");
  });

  it("400 when allApplicants is not an array", async () => {
    const res = await post(batchBody({ allApplicants: "x" }));
    expect(res.body.error).toMatch(/allApplicants must be an array/);
  });

  it("400 when an applicant lacks required keys", async () => {
    const res = await post(batchBody({ allApplicants: [{ userId: "u1", name: "A", email: "e" }] }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/resumeId/);
  });

  it("500 with the message when handler throws an Error", async () => {
    m.handle.mockRejectedValue(new Error("kaput"));
    const res = await post(batchBody());
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error", message: "kaput" });
  });

  it("500 with 'Unknown error' when a non-Error is thrown", async () => {
    m.handle.mockRejectedValue("str");
    const res = await post(batchBody());
    expect(res.body.message).toBe("Unknown error");
  });
});
