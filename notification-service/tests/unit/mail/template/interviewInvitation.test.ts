import { describe, it, expect } from "vitest";
import { generateInterviewInvitationMail as gen } from "../../../../src/mail/template/interviewInvitation";
import { invitationPayload } from "../../../fixtures/payloads";

describe("generateInterviewInvitationMail", () => {
  it("interpolates all key fields", () => {
    const html = gen(invitationPayload());
    expect(html).toContain("Dear Bob");
    expect(html).toContain("Frontend Dev");
    expect(html).toContain("Acme");
    expect(html).toContain("Complete by 2030-01-01");
    expect(html).toContain('href="https://app.test/interview/1"');
    expect(html).toContain('href="https://app.test/guide"');
    expect(html).toContain("mailto:hr@acme.com");
    expect(html).toContain("Support Contact");
  });

  it("falls back to default organization name", () => {
    const html = gen(invitationPayload({ OrganizationName: undefined }));
    expect(html).toContain("Our Company");
  });

  it("omits support contact and says 'immediately' without organization email", () => {
    const html = gen(invitationPayload({ OrganizationEmail: "" }));
    expect(html).not.toContain("Support Contact");
    expect(html).toContain("immediately");
    expect(html).not.toContain("mailto:");
  });

  it("omits support contact when recruiterName is explicitly empty", () => {
    const html = gen(invitationPayload({ recruiterName: "" }));
    expect(html).not.toContain("Support Contact");
    expect(html).toContain("mailto:hr@acme.com");
  });

  it("uses the default guide link when none is given", () => {
    const html = gen(invitationPayload({ guideLink: undefined }));
    expect(html).toContain('href="/interview-guide"');
  });
});
