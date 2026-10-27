import { describe, it, expect, vi } from "vitest";

const svc = vi.hoisted(() => ({
  getUserNotifications: vi.fn(), markAsRead: vi.fn(), markAllAsRead: vi.fn(), deleteNotification: vi.fn(),
}));
vi.mock("../../../src/in-app/service/inapp-notification.service", () => ({ inAppNotificationService: svc }));

import { notificationController as c } from "../../../src/controllers";
import { ApiError } from "../../../src/utils/ApiError";

const mockRes = () => { const r: any = {}; r.status = vi.fn(() => r); r.json = vi.fn(() => r); return r; };
const run = async (fn: any, params: any) => {
  const res = mockRes(), next = vi.fn();
  fn({ params } as any, res, next);
  await new Promise((r) => setImmediate(r));
  return { res, next };
};

describe("NotificationController", () => {
  it("fetchNotificationsOfAUser returns notifications", async () => {
    svc.getUserNotifications.mockResolvedValue([{ id: 1 }]);
    const { res } = await run(c.fetchNotificationsOfAUser, { userId: "u1" });
    expect(svc.getUserNotifications).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toMatchObject({ status: 200, data: [{ id: 1 }], success: true });
  });

  it("fetchNotificationsOfAUser rejects missing userId with 400", async () => {
    const { next } = await run(c.fetchNotificationsOfAUser, {});
    expect(next.mock.calls[0][0]).toBeInstanceOf(ApiError);
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it("fetchNotificationsOfAUser forwards service errors", async () => {
    svc.getUserNotifications.mockRejectedValue(new Error("db"));
    const { next } = await run(c.fetchNotificationsOfAUser, { userId: "u" });
    expect(next.mock.calls[0][0].message).toBe("db");
  });

  it("readNotification returns updated doc", async () => {
    svc.markAsRead.mockResolvedValue({ _id: "n1", isRead: true });
    const { res } = await run(c.readNotification, { notificationId: "n1" });
    expect(res.json.mock.calls[0][0].data).toEqual({ _id: "n1", isRead: true });
  });

  it("readNotification 400 when id missing", async () => {
    const { next } = await run(c.readNotification, {});
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it("readNotification 404 when service returns null", async () => {
    svc.markAsRead.mockResolvedValue(null);
    const { next } = await run(c.readNotification, { notificationId: "n1" });
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it("readAllNotification responds 200 with service result", async () => {
    svc.markAllAsRead.mockReturnValue({ modified: 2 });
    const { res } = await run(c.readAllNotification, { userId: "u" });
    expect(svc.markAllAsRead).toHaveBeenCalledWith("u");
    expect(res.json.mock.calls[0][0]).toMatchObject({ status: 200, data: { modified: 2 } });
  });

  it("deleteNotification responds 200 with service result", async () => {
    svc.deleteNotification.mockReturnValue({ _id: "n1" });
    const { res } = await run(c.deleteNotification, { notificationId: "n1" });
    expect(svc.deleteNotification).toHaveBeenCalledWith("n1");
    expect(res.json.mock.calls[0][0].message).toBe("Notification deleted Successfully");
  });
});
