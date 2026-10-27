import { describe, it, expect, vi } from "vitest";
import { mockQuery, fakeDoc } from "../helpers/testDb";
import { Notification } from "../../src/in-app/model/inapp-notification";
import { inAppNotificationService } from "../../src/in-app/service/inapp-notification.service";
import { handleInAppNotifications } from "../../src/in-app/handlers/inapp-notification.handler";

// No MongoDB is available offline, so persistence is exercised through real model
// validation (validateSync) plus spies on the static query methods.

describe("service + real model", () => {
  it("builds an interview notification that satisfies the schema", () => {
    const doc = new Notification({
      recieverId: "c1", recieverEmail: "a@b.c", title: "Interview Scheduled",
      message: "m", type: "interview_scheduled", data: { interviewId: "i1" }, isRead: false,
    });
    expect(doc.validateSync()).toBeUndefined();
  });

  it("getUserNotifications chains find().sort()", async () => {
    const q = mockQuery([fakeDoc()]);
    vi.spyOn(Notification, "find").mockReturnValue(q as any);
    await inAppNotificationService.getUserNotifications("u1");
    expect(q.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("surfaces DocumentNotFoundError from orFail on delete", async () => {
    vi.spyOn(Notification, "findByIdAndDelete").mockReturnValue(mockQuery(null) as any);
    await expect(inAppNotificationService.deleteNotification("x")).rejects.toMatchObject({ name: "DocumentNotFoundError" });
  });

  // BUG (characterization): the handler builds notifications without `recieverId`, which
  // the schema marks as required, so real inserts for these events fail validation.
  it("handler-built payloads are missing required recieverId (known bug)", () => {
    const doc = new Notification({
      recieverEmail: "u@t.c", title: "Payment Failed ", message: "m", type: "error", link: "/billing/payment-methods",
    });
    expect(doc.validateSync()?.errors.recieverId).toBeDefined();
  });

  it("with the DB rejecting, the handler falls back without throwing", async () => {
    vi.spyOn(Notification, "create").mockRejectedValue(new Error("validation failed"));
    // `io` is not initialised in this file, so even the fallback emit fails; handler must still resolve.
    await expect(handleInAppNotifications({ type: "payment.failed", recieverEmail: "u@t.c" })).resolves.toBeUndefined();
  });
});
