import { describe, it, expect, vi } from "vitest";
import { EventTypes } from "../../../../src/events/eventTypes";

const m = vi.hoisted(() => {
  const emit = vi.fn();
  return {
    emit,
    io: { to: vi.fn(() => ({ emit })) },
    svc: { createNotification: vi.fn(), notifyInterviewCreation: vi.fn() },
  };
});
vi.mock("../../../../src/config/socket", () => ({ io: m.io }));
vi.mock("../../../../src/in-app/service/inapp-notification.service", () => ({ inAppNotificationService: m.svc }));

import { handleInAppNotifications as handle } from "../../../../src/in-app/handlers/inapp-notification.handler";

const E = EventTypes;
const base = { recieverEmail: "u@t.c", jobTitle: "Dev", companyName: "Acme", jobId: "j1", resumeId: "r1" };

// [event type, extra event fields, expected title, expected type, expected link]
const table: [string, any, string, string, string][] = [
  [E.RESUME_ANALYSIS_COMPLETED, {}, "Resume Analysis Complete", "success", "/resume/r1"],
  [E.RESUME_ANALYSIS_FAILED, {}, "Resume Analysis Failed", "error", "/resume/upload"],
  [E.JOB_POSTING_CREATED, {}, "Job Posted Successfully!", "success", "/jobs/j1"],
  [E.JOB_MATCH_FOUND, { matchScore: 91 }, "New Job Match Found!", "info", "/jobs/j1"],
  [E.JOB_APPLICATION_REJECTED, {}, "Application Update", "warning", "/jobs/search"],
  [E.JOB_APPLICATION_ACCEPTED, { applicationId: "a1" }, "Congratulations! Job Offer Received 🎊", "success", "/applications/a1/offer"],
  [E.CAREER_RECOMMENDATION_GENERATED, {}, "New Career Recommendations", "info", "/dashboard/recommendations"],
  [E.USER_EMAIL_VERIFIED, {}, "Email Verified Successfully ✅", "success", "/profile"],
  [E.USER_ACCOUNT_LOCKED, {}, "Account Temporarily Locked 🔒", "error", "/support"],
  [E.USER_ACCOUNT_UNLOCKED, {}, "Account Unlocked 🔓", "success", "/dashboard"],
  [E.SUSPICIOUS_LOGIN_DETECTED, { location: "Paris", device: "Pixel" }, "Suspicious Login Detected ⚠️", "warning", "/security/activity"],
  [E.RECRUITER_PROFILE_APPROVED, {}, "Recruiter Profile Approved! 🎉", "success", "/recruiter/dashboard"],
  [E.RECRUITER_PROFILE_REJECTED, {}, "Recruiter Profile Needs Review", "warning", "/recruiter/profile/edit"],
  [E.SYSTEM_MAINTENANCE_SCHEDULED, { maintenanceDate: "Friday" }, "Scheduled Maintenance Notice 🔧", "info", "/system/status"],
  [E.SYSTEM_UPDATE_AVAILABLE, {}, "New Features Available! ✨", "info", "/updates"],
  [E.INTERVIEW_CANCELLED, { reason: "sick" }, "Interview Cancelled", "warning", "/interviews"],
  [E.ASSIGNMENT_CREATED, { assignmentId: "as1", dueDate: "Mon" }, "New Assignment Received 📝", "info", "/assignments/as1"],
  [E.ASSIGNMENT_GRADED, { assignmentId: "as1", score: 8, totalScore: 10 }, "Assignment Graded ", "success", "/assignments/as1/results"],
  [E.SUBSCRIPTION_EXPIRED, {}, "Subscription Expired ", "warning", "/subscription/renew"],
  [E.PAYMENT_FAILED, {}, "Payment Failed ", "error", "/billing/payment-methods"],
  [E.MESSAGE_RECEIVED, { senderName: "Sam", conversationId: "cv1", messagePreview: "hey" }, "New Message from Sam", "info", "/messages/cv1"],
];

describe("handleInAppNotifications", () => {
  it.each(table)("%s creates the right notification and emits it", async (type, extra, title, ntype, link) => {
    const created = { id: "created" };
    m.svc.createNotification.mockResolvedValue(created);
    await handle({ ...base, ...extra, type });
    expect(m.svc.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      recieverEmail: "u@t.c", title, type: ntype, link,
    }));
    expect(m.io.to).toHaveBeenCalledWith("u@t.c");
    expect(m.emit).toHaveBeenCalledWith("notification", created);
  });

  it("interpolates event data into messages", async () => {
    m.svc.createNotification.mockResolvedValue({});
    const msg = async (type: string, extra: any) => {
      await handle({ ...base, ...extra, type });
      return m.svc.createNotification.mock.calls.at(-1)![0].message as string;
    };
    expect(await msg(E.JOB_POSTING_CREATED, {})).toContain('"Dev"');
    expect(await msg(E.JOB_MATCH_FOUND, { matchScore: 91 })).toBe("We found a 91% match for Dev at Acme. Check it out!");
    expect(await msg(E.SUSPICIOUS_LOGIN_DETECTED, { location: "Paris", device: "Pixel" })).toContain("Paris using Pixel");
    expect(await msg(E.SYSTEM_MAINTENANCE_SCHEDULED, { maintenanceDate: "Friday" })).toContain("Friday");
    expect(await msg(E.INTERVIEW_CANCELLED, { reason: "sick" })).toContain("sick");
    expect(await msg(E.INTERVIEW_CANCELLED, {})).toBe("Your interview for Dev at Acme has been cancelled. ");
    expect(await msg(E.ASSIGNMENT_GRADED, { score: 8, totalScore: 10 })).toContain("8/10");
    expect(await msg(E.ASSIGNMENT_CREATED, { dueDate: "Mon" })).toContain("Mon");
    expect(await msg(E.MESSAGE_RECEIVED, { messagePreview: "hey" })).toBe("hey");
    expect(await msg(E.MESSAGE_RECEIVED, {})).toBe("You have received a new message.");
  });

  it("NEW_JOB_APPLICATION forwards the raw event to createNotification", async () => {
    const ev = { ...base, type: E.NEW_JOB_APPLICATION, title: "x" };
    m.svc.createNotification.mockResolvedValue({ id: 1 });
    await handle(ev);
    expect(m.svc.createNotification).toHaveBeenCalledWith(ev);
    expect(m.emit).toHaveBeenCalled();
  });

  it("INTERVIEW_SCHEDULED delegates to notifyInterviewCreation", async () => {
    const ev = { ...base, type: E.INTERVIEW_SCHEDULED };
    m.svc.notifyInterviewCreation.mockResolvedValue({ id: 2 });
    await handle(ev);
    expect(m.svc.notifyInterviewCreation).toHaveBeenCalledWith(ev);
    expect(m.svc.createNotification).not.toHaveBeenCalled();
    expect(m.emit).toHaveBeenCalledWith("notification", { id: 2 });
  });

  it("does not emit when no notification was produced", async () => {
    m.svc.createNotification.mockResolvedValue(null);
    await handle({ ...base, type: E.PAYMENT_FAILED });
    expect(m.io.to).not.toHaveBeenCalled();
  });

  it.each([
    E.JOB_APPLICATION_SHORTLISTED, E.JOB_POSTING_EXPIRED, E.CANDIDATE_WITHDRAWN_APPLICATION,
    E.BATCH_REJECTION_FEEDBACK, "totally.unknown",
  ])("ignores unhandled type %s with a warning", async (type) => {
    await handle({ ...base, type });
    expect(console.warn).toHaveBeenCalledWith(`Unhandled event type: ${type}`);
    expect(m.svc.createNotification).not.toHaveBeenCalled();
    expect(m.emit).not.toHaveBeenCalled();
  });

  it("on failure creates and emits an error notification for the user", async () => {
    m.svc.createNotification
      .mockRejectedValueOnce(new Error("db"))
      .mockResolvedValueOnce({ id: "err" });
    await handle({ ...base, type: E.PAYMENT_FAILED });
    expect(m.svc.createNotification).toHaveBeenLastCalledWith(expect.objectContaining({
      title: "Notification Error", type: "error", link: "/dashboard",
    }));
    expect(m.emit).toHaveBeenCalledWith("notification", { id: "err" });
  });

  it("swallows a failing fallback notification", async () => {
    m.svc.createNotification.mockRejectedValue(new Error("db"));
    await expect(handle({ ...base, type: E.PAYMENT_FAILED })).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith("Failed to send error notification:", expect.any(Error));
  });

  it("does not attempt a fallback without a recieverEmail", async () => {
    m.svc.createNotification.mockRejectedValue(new Error("db"));
    await handle({ type: E.PAYMENT_FAILED });
    expect(m.svc.createNotification).toHaveBeenCalledTimes(1);
  });
});
