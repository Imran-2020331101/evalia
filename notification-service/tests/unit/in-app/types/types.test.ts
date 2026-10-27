import { describe, it, expect } from "vitest";
import { NotificationZodSchema } from "../../../../src/in-app/types/notification.types";
import { InterviewCreatedNotificationSchema, InterviewStatusSchema } from "../../../../src/in-app/types/interviewNotifications.types";
import { interviewEvent } from "../../../fixtures/payloads";

describe("NotificationZodSchema", () => {
  const base = { recieverId: "u", recieverEmail: "a@b.co", title: "t", message: "m", type: "info" };
  it("applies defaults for isRead and createdAt", () => {
    const r = NotificationZodSchema.parse(base);
    expect(r.isRead).toBe(false);
    expect(r.createdAt).toBeInstanceOf(Date);
  });
  it("rejects invalid email", () => {
    expect(NotificationZodSchema.safeParse({ ...base, recieverEmail: "bad" }).success).toBe(false);
  });
});

describe("Interview schemas", () => {
  it("validates statuses", () => {
    expect(InterviewStatusSchema.safeParse("SCHEDULED").success).toBe(true);
    expect(InterviewStatusSchema.safeParse("NOPE").success).toBe(false);
  });
  it("accepts string or Date deadline", () => {
    expect(InterviewCreatedNotificationSchema.safeParse(interviewEvent()).success).toBe(true);
    expect(InterviewCreatedNotificationSchema.safeParse(interviewEvent({ deadline: new Date() })).success).toBe(true);
    expect(InterviewCreatedNotificationSchema.safeParse(interviewEvent({ deadline: 5 })).success).toBe(false);
  });
});
