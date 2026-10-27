import { vi } from "vitest";

/** Shared hoistable holder for a fake nodemailer transporter. */
export const makeTransporter = () => ({
  verify: vi.fn(),
  sendMail: vi.fn().mockResolvedValue({ messageId: "msg-1" }),
});
