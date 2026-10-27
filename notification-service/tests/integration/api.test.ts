import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { buildTestApp } from "../helpers/testApp";
import { mockQuery, fakeDoc } from "../helpers/testDb";
import { batchBody } from "../fixtures/payloads";
import { Notification } from "../../src/in-app/model/inapp-notification";

const app = buildTestApp();

describe("GET /api/notifications/:userId", () => {
  it("returns the user's notifications in the ApiResponse envelope", async () => {
    const find = vi.spyOn(Notification, "find").mockReturnValue(mockQuery([fakeDoc()]) as any);
    const res = await request(app).get("/api/notifications/u1");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 200, success: true, message: "Notifications retrieved successfully" });
    expect(res.body.data).toHaveLength(1);
    expect(find).toHaveBeenCalledWith({ recieverId: "u1" });
  });

  it("returns 500 envelope on DB failure", async () => {
    vi.spyOn(Notification, "find").mockReturnValue(mockQuery(null, { reject: new Error("db") }) as any);
    const res = await request(app).get("/api/notifications/u1");
    expect(res.status).toBe(500);
    expect(res.body.response).toMatchObject({ message: "db", success: false });
  });
});

describe("PUT /api/notifications/:notificationId/read", () => {
  it("marks as read", async () => {
    vi.spyOn(Notification, "findByIdAndUpdate").mockReturnValue(mockQuery(fakeDoc({ isRead: true })) as any);
    const res = await request(app).put("/api/notifications/n1/read");
    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  // The controller's `!updated` -> 404 branch is unreachable because the service uses
  // .orFail(), which throws DocumentNotFoundError (-> 500) instead of returning null.
  it("currently answers 500 (not 404) for an unknown id (known bug)", async () => {
    vi.spyOn(Notification, "findByIdAndUpdate").mockReturnValue(mockQuery(null) as any);
    const res = await request(app).put("/api/notifications/missing/read");
    expect(res.status).toBe(500);
  });
});

describe("PUT /:userId/read-all and DELETE /:notificationId", () => {
  // Controller forgets to `await` the service call, so a Promise is serialised as `{}`.
  it("read-all responds 200 but the payload is an un-awaited promise (known bug)", async () => {
    vi.spyOn(Notification, "updateMany").mockReturnValue(mockQuery({ modifiedCount: 2 }) as any);
    const res = await request(app).put("/api/notifications/u1/read-all");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({});
    expect(Notification.updateMany).toHaveBeenCalledWith({ recieverId: "u1" }, { $set: { isRead: true } });
  });

  it("delete responds 200 and invokes findByIdAndDelete (payload un-awaited)", async () => {
    vi.spyOn(Notification, "findByIdAndDelete").mockReturnValue(mockQuery(fakeDoc()) as any);
    const res = await request(app).delete("/api/notifications/n1");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Notification deleted Successfully");
    expect(Notification.findByIdAndDelete).toHaveBeenCalledWith("n1");
  });
});

describe("POST /api/notifications/batch-rejection-feedback (real handler)", () => {
  it("validates body", async () => {
    const res = await request(app).post("/api/notifications/batch-rejection-feedback").send({ jobId: "x" });
    expect(res.status).toBe(400);
  });

  it("accepts a valid body (the handler currently ignores this event type)", async () => {
    const create = vi.spyOn(Notification, "create");
    const res = await request(app).post("/api/notifications/batch-rejection-feedback").send(batchBody());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, candidatesToProcess: 2 });
    expect(create).not.toHaveBeenCalled(); // BUG: BATCH_REJECTION_FEEDBACK has no case in the handler
  });
});

describe("unknown routes", () => {
  it("404 envelope", async () => {
    const res = await request(app).get("/api/other");
    expect(res.status).toBe(404);
  });
});
