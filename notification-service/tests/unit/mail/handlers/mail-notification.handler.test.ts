import { describe, it, expect, vi } from "vitest";

const m = vi.hoisted(() => ({
  svc: { sendInterviewInvitation: vi.fn(), sendRejectionMail: vi.fn() },
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));
vi.mock("../../../../src/mail/service/mail-notification.service", () => ({ emailNotificationService: m.svc }));
vi.mock("../../../../src/utils/logger", () => ({ default: m.logger }));

import { handleIncomingMailEvent as handle } from "../../../../src/mail/handlers/mail-notification.handler";

describe("handleIncomingMailEvent", () => {
  it("dispatches shortlisted events to the interview invitation mail", async () => {
    const ev = { type: "job.application.shortlisted", candidateEmail: "a@b.c" };
    await handle(ev);
    expect(m.svc.sendInterviewInvitation).toHaveBeenCalledWith(ev);
    expect(m.svc.sendRejectionMail).not.toHaveBeenCalled();
  });

  it("dispatches rejected events to the rejection mail", async () => {
    const ev = { type: "job.application.rejected" };
    await handle(ev);
    expect(m.svc.sendRejectionMail).toHaveBeenCalledWith(ev);
    expect(m.svc.sendInterviewInvitation).not.toHaveBeenCalled();
  });

  it("builds an acceptance notification and logs success", async () => {
    m.svc.sendRejectionMail.mockResolvedValue(true);
    await handle({ type: "job.application.accepted", userName: "Zed", userEmail: "z@t.c", jobTitle: "Dev", jobId: "j", stage: "Offer" });
    const n = m.svc.sendRejectionMail.mock.calls[0][0];
    expect(n).toMatchObject({ userName: "Zed", userEmail: "z@t.c", type: "APPLICATION_ACCEPTED", jobTitle: "Dev", jobId: "j", stage: "Offer" });
    expect(n.subject).toContain("Dev");
    expect(n.body).toContain("Dear Zed");
    expect(n.sentAt).toMatch(/^\d{4}-/);
    expect(m.logger.info).toHaveBeenCalledWith("Email sent successfully for event:", "job.application.accepted");
  });

  it("uses defaults for missing acceptance fields", async () => {
    m.svc.sendRejectionMail.mockResolvedValue(true);
    await handle({ type: "job.application.accepted", candidateEmail: "c@t.c", jobTitle: "Dev" });
    const n = m.svc.sendRejectionMail.mock.calls[0][0];
    expect(n.userName).toBe("Team Member");
    expect(n.userEmail).toBe("c@t.c");
    expect(n.stage).toBe("Final Review");
    expect(n.body).toContain("Dear New Team Member");
  });

  it("logs an error when the send reports failure", async () => {
    m.svc.sendRejectionMail.mockResolvedValue(false);
    await handle({ type: "job.application.accepted", jobTitle: "Dev" });
    expect(m.logger.error).toHaveBeenCalledWith("Failed to send email for event:", "job.application.accepted");
  });

  it("warns and sends nothing for unknown types", async () => {
    await handle({ type: "weird" });
    expect(m.logger.warn).toHaveBeenCalledWith("Unhandled email notification type:", "weird");
    expect(m.svc.sendRejectionMail).not.toHaveBeenCalled();
  });

  it("catches and logs errors thrown while sending", async () => {
    const e = new Error("smtp");
    m.svc.sendRejectionMail.mockRejectedValue(e);
    await expect(handle({ type: "job.application.accepted", jobTitle: "D" })).resolves.toBeUndefined();
    expect(m.logger.error).toHaveBeenCalledWith("Error handling email notification event:", e);
  });

  it("catches synchronous errors (null event)", async () => {
    await expect(handle(null)).resolves.toBeUndefined();
    expect(m.logger.error).toHaveBeenCalled();
  });
});
