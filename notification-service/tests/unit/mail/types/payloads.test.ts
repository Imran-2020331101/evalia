import { describe, it, expect } from "vitest";
import { InterviewInvitationPayloadSchema } from "../../../../src/mail/types/interview-invitation.payload";
import { RejectionMailPayloadSchema } from "../../../../src/mail/types/rejection-mail.type";
import { invitationPayload, rejectionPayload } from "../../../fixtures/payloads";

describe("InterviewInvitationPayloadSchema", () => {
  it("accepts a valid payload and keeps extra keys (loose)", () => {
    const r = InterviewInvitationPayloadSchema.safeParse({ ...invitationPayload(), extra: 1 });
    expect(r.success).toBe(true);
    expect((r.data as any).extra).toBe(1);
  });
  it("rejects bad email / url", () => {
    expect(InterviewInvitationPayloadSchema.safeParse(invitationPayload({ candidateEmail: "x" })).success).toBe(false);
    expect(InterviewInvitationPayloadSchema.safeParse(invitationPayload({ interviewLink: "nourl" })).success).toBe(false);
  });
});

describe("RejectionMailPayloadSchema", () => {
  it("accepts a valid payload", () => {
    expect(RejectionMailPayloadSchema.safeParse(rejectionPayload()).success).toBe(true);
  });
  it("rejects out-of-range percentage and bad fit", () => {
    const p = rejectionPayload();
    p.data.review.matchPercentage = 101;
    expect(RejectionMailPayloadSchema.safeParse(p).success).toBe(false);
    const q = rejectionPayload();
    (q.data.review as any).fit = "Meh";
    expect(RejectionMailPayloadSchema.safeParse(q).success).toBe(false);
  });
});
