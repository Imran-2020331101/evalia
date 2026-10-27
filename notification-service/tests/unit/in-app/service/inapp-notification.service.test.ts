import { describe, it, expect, vi } from "vitest";
import { mockQuery, fakeDoc } from "../../../helpers/testDb";
import { interviewEvent } from "../../../fixtures/payloads";

const m = vi.hoisted(() => ({
  Notification: { create: vi.fn(), find: vi.fn(), findByIdAndUpdate: vi.fn(), updateMany: vi.fn(), findByIdAndDelete: vi.fn() },
  notifyUser: vi.fn(), notifyInterviewUpdate: vi.fn(),
}));
vi.mock("../../../../src/in-app/model/inapp-notification", () => ({ Notification: m.Notification }));
vi.mock("../../../../src/config/socket", () => ({ notifyUser: m.notifyUser, notifyInterviewUpdate: m.notifyInterviewUpdate }));

import { inAppNotificationService as svc } from "../../../../src/in-app/service/inapp-notification.service";

describe("InAppNotificationService", () => {
  it("createNotification persists and returns the doc", async () => {
    const doc = fakeDoc();
    m.Notification.create.mockResolvedValue(doc);
    expect(await svc.createNotification({ title: "t" })).toBe(doc);
    expect(m.Notification.create).toHaveBeenCalledWith({ title: "t" });
  });

  it("getUserNotifications queries by receiver sorted newest first", async () => {
    const q = mockQuery([fakeDoc()]);
    m.Notification.find.mockReturnValue(q);
    expect(await svc.getUserNotifications("u1")).toHaveLength(1);
    expect(m.Notification.find).toHaveBeenCalledWith({ recieverId: "u1" });
    expect(q.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("markAsRead updates isRead and returns the new doc", async () => {
    m.Notification.findByIdAndUpdate.mockReturnValue(mockQuery(fakeDoc({ isRead: true })));
    expect((await svc.markAsRead("n1")).isRead).toBe(true);
    expect(m.Notification.findByIdAndUpdate).toHaveBeenCalledWith("n1", { isRead: true }, { new: true });
  });

  it("markAsRead rejects with DocumentNotFoundError when nothing matched", async () => {
    m.Notification.findByIdAndUpdate.mockReturnValue(mockQuery(null));
    await expect(svc.markAsRead("zz")).rejects.toMatchObject({ name: "DocumentNotFoundError" });
  });

  it("markAllAsRead sets isRead for the receiver", async () => {
    m.Notification.updateMany.mockReturnValue(mockQuery({ modifiedCount: 3 }));
    expect(await svc.markAllAsRead("u1")).toEqual({ modifiedCount: 3 });
    expect(m.Notification.updateMany).toHaveBeenCalledWith({ recieverId: "u1" }, { $set: { isRead: true } });
  });

  it("deleteNotification deletes by id and fails when missing", async () => {
    m.Notification.findByIdAndDelete.mockReturnValue(mockQuery(fakeDoc()));
    expect(await svc.deleteNotification("n1")).toMatchObject({ _id: "n1" });
    m.Notification.findByIdAndDelete.mockReturnValue(mockQuery(null));
    await expect(svc.deleteNotification("n2")).rejects.toThrow();
  });

  it("notifyInterviewCreation saves a notification and emits both socket events", async () => {
    const saved = fakeDoc({ _id: "s1", title: "Interview Scheduled", type: "interview_scheduled", data: { x: 1 } });
    m.Notification.create.mockResolvedValue(saved);
    const ev = interviewEvent();
    const out = await svc.notifyInterviewCreation(ev as any);

    expect(out).toBe(saved);
    expect(m.Notification.create).toHaveBeenCalledWith(expect.objectContaining({
      recieverId: "c1", recieverEmail: "alice@test.com", title: "Interview Scheduled",
      type: "interview_scheduled", isRead: false,
      message: "You have been scheduled for an interview for Backend Dev",
      data: expect.objectContaining({ interviewId: "i1", jobId: "j1", totalQuestions: 5, status: "SCHEDULED" }),
    }));
    expect(m.notifyUser).toHaveBeenCalledWith("alice@test.com", expect.objectContaining({ id: "s1", title: "Interview Scheduled" }));
    expect(m.notifyInterviewUpdate).toHaveBeenCalledWith("c1", expect.objectContaining({
      type: "INTERVIEW_SCHEDULED", interviewId: "i1", timestamp: expect.any(Date),
    }));
  });

  it("notifyInterviewCreation does not emit if saving fails", async () => {
    m.Notification.create.mockRejectedValue(new Error("db"));
    await expect(svc.notifyInterviewCreation(interviewEvent() as any)).rejects.toThrow("db");
    expect(m.notifyUser).not.toHaveBeenCalled();
  });
});
