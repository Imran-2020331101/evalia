import { describe, it, expect, vi, beforeAll } from "vitest";
import { rejectionPayload, invitationPayload } from "../../../fixtures/payloads";

const m = vi.hoisted(() => {
  const transporter = { verify: vi.fn(), sendMail: vi.fn() };
  return {
    transporter,
    createTransport: vi.fn(() => transporter),
    logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
    rej: vi.fn(() => "<rej/>"),
    inv: vi.fn(() => "<inv/>"),
  };
});
vi.mock("nodemailer", () => ({ default: { createTransport: m.createTransport } }));
vi.mock("../../../../src/utils/logger", () => ({ default: m.logger }));
vi.mock("../../../../src/mail/template/rejection", () => ({ generateRejectionFeedbackEmail: m.rej }));
vi.mock("../../../../src/mail/template/interviewInvitation", () => ({ generateInterviewInvitationMail: m.inv }));

import { emailNotificationService as svc } from "../../../../src/mail/service/mail-notification.service";

let createArgs: any, verifyCb: any;
beforeAll(() => {
  createArgs = m.createTransport.mock.calls[0];
  verifyCb = m.transporter.verify.mock.calls[0][0];
});

describe("EmailNotificationService", () => {
  it("creates a gmail transporter from env credentials", () => {
    expect(createArgs[0]).toEqual({
      service: "gmail",
      auth: { user: "sender@test.local", pass: "pw" },
    });
  });

  it("logs verification success and failure", () => {
    verifyCb(null, true);
    expect(m.logger.info).toHaveBeenCalledWith("Email transporter is ready");
    const err = new Error("auth");
    verifyCb(err, false);
    expect(m.logger.error).toHaveBeenCalledWith("Email transporter verification failed:", err);
  });

  it("sendMail passes options to the transporter and returns true", async () => {
    m.transporter.sendMail.mockResolvedValue({ messageId: "id1" });
    const ok = await svc.sendMail({ to: "a@b.c", subject: "S", html: "<p/>", text: "t" });
    expect(ok).toBe(true);
    expect(m.transporter.sendMail).toHaveBeenCalledWith({
      from: "sender@test.local", to: "a@b.c", subject: "S", html: "<p/>", text: "t",
    });
    expect(m.logger.info).toHaveBeenCalledWith("Email sent successfully to a@b.c:", "id1");
  });

  it("sendMail propagates transporter errors", async () => {
    m.transporter.sendMail.mockRejectedValue(new Error("smtp down"));
    await expect(svc.sendMail({ to: "a", subject: "s", html: "h" })).rejects.toThrow("smtp down");
  });

  it("sendRejectionMail renders the rejection template", async () => {
    m.transporter.sendMail.mockResolvedValue({ messageId: "x" });
    const p = rejectionPayload();
    expect(await svc.sendRejectionMail(p as any)).toBe(true);
    expect(m.rej).toHaveBeenCalledWith(p);
    expect(m.transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "alice@test.com", html: "<rej/>", subject: "Update on your Application for the job " }),
    );
  });

  it("sendInterviewInvitation renders the invitation template with job/org subject", async () => {
    m.transporter.sendMail.mockResolvedValue({ messageId: "x" });
    const p = invitationPayload();
    expect(await svc.sendInterviewInvitation(p as any)).toBe(true);
    expect(m.inv).toHaveBeenCalledWith(p);
    expect(m.transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "bob@test.com", subject: "Interview for Frontend Dev at Acme", html: "<inv/>" }),
    );
  });

  it("finalInterviewInvitation is a stub returning true", async () => {
    expect(await svc.finalInterviewInvitation()).toBe(true);
  });
});
