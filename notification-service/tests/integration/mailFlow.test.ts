import { describe, it, expect, vi, beforeEach } from "vitest";
import { rejectionPayload, invitationPayload } from "../fixtures/payloads";

const m = vi.hoisted(() => ({ sendMail: vi.fn(), verify: vi.fn() }));
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: m.sendMail, verify: m.verify }) },
}));

import { handleIncomingMailEvent } from "../../src/mail/handlers/mail-notification.handler";

const flush = () => new Promise((r) => setImmediate(r));
beforeEach(() => { m.sendMail.mockResolvedValue({ messageId: "id" }); });

describe("mail flow: event -> handler -> service -> template -> SMTP", () => {
  it("shortlisted event sends a rendered interview invitation", async () => {
    await handleIncomingMailEvent({ type: "job.application.shortlisted", ...invitationPayload() });
    await flush();
    expect(m.sendMail).toHaveBeenCalledOnce();
    const mail = m.sendMail.mock.calls[0][0];
    expect(mail).toMatchObject({ to: "bob@test.com", from: "sender@test.local", subject: "Interview for Frontend Dev at Acme" });
    expect(mail.html).toContain("Dear Bob");
    expect(mail.html).toContain("https://app.test/interview/1");
  });

  it("rejected event sends a rendered rejection with feedback", async () => {
    await handleIncomingMailEvent(rejectionPayload());
    await flush();
    const mail = m.sendMail.mock.calls[0][0];
    expect(mail.to).toBe("alice@test.com");
    expect(mail.html).toContain("✔ Node.js");
    expect(mail.html).toContain("✖ Kubernetes");
  });

  it("an SMTP failure while handling a rejection does not crash the process", async () => {
    m.sendMail.mockRejectedValue(new Error("smtp"));
    // Handler does not await the send (fire-and-forget); the rejection is surfaced as unhandled.
    const onUnhandled = vi.fn();
    process.on("unhandledRejection", onUnhandled);
    await handleIncomingMailEvent(rejectionPayload());
    await flush(); await flush();
    process.off("unhandledRejection", onUnhandled);
    expect(m.sendMail).toHaveBeenCalled();
    expect(onUnhandled).toHaveBeenCalled(); // documents the missing `await` in the handler
  });

  // BUG (characterization): the 'accepted' branch builds a notification with a different
  // shape and hands it to sendRejectionMail, whose template needs `data.review`. The template
  // throws, the handler swallows the error, and no acceptance e-mail is ever sent.
  it("accepted event never results in an e-mail (known bug)", async () => {
    await handleIncomingMailEvent({ type: "job.application.accepted", userName: "Zed", userEmail: "z@t.c", jobTitle: "Dev" });
    await flush();
    expect(m.sendMail).not.toHaveBeenCalled();
  });

  it("unknown events send nothing", async () => {
    await handleIncomingMailEvent({ type: "nope" });
    expect(m.sendMail).not.toHaveBeenCalled();
  });
});
