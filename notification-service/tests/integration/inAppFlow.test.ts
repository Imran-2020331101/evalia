import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { startSocketServer, signToken, once } from "../helpers/testApp";
import { fakeDoc } from "../helpers/testDb";
import { interviewEvent } from "../fixtures/payloads";
import { Notification } from "../../src/in-app/model/inapp-notification";
import { handleInAppNotifications } from "../../src/in-app/handlers/inapp-notification.handler";

let srv: Awaited<ReturnType<typeof startSocketServer>>;
beforeAll(async () => { srv = await startSocketServer(); });
afterAll(async () => { await srv.close(); });

describe("in-app flow: event -> service -> model -> socket client", () => {
  it("persists a notification and pushes it to the receiver's room", async () => {
    const create = vi.spyOn(Notification, "create").mockImplementation(async (d: any) => ({ ...fakeDoc(), ...d }) as any);
    const client = await srv.connect({ auth: { token: signToken("rcv@test.com") } });
    const got = once(client, "notification");

    await handleInAppNotifications({ type: "payment.failed", recieverEmail: "rcv@test.com" });

    const n = await got;
    expect(create).toHaveBeenCalledOnce();
    expect(n).toMatchObject({ title: "Payment Failed ", type: "error", recieverEmail: "rcv@test.com" });
  });

  it("interview.scheduled pushes both a general and an interview-specific event", async () => {
    vi.spyOn(Notification, "create").mockImplementation(async (d: any) => ({ ...fakeDoc(), ...d }) as any);
    const byEmail = await srv.connect({ auth: { token: signToken("alice@test.com") } });
    const byId = await srv.connect({ auth: { token: signToken("c1") } });
    const general = once(byEmail, "notification");
    const specific = once(byId, "interview-notification");

    await handleInAppNotifications(interviewEvent());

    expect(await general).toMatchObject({ title: "Interview Scheduled", type: "interview_scheduled" });
    expect(await specific).toMatchObject({ type: "INTERVIEW_SCHEDULED", interviewId: "i1", totalQuestions: 5 });
  });

  it("DB failure produces a 'Notification Error' push to the user", async () => {
    const create = vi.spyOn(Notification, "create")
      .mockRejectedValueOnce(new Error("db down"))
      .mockImplementationOnce(async (d: any) => ({ ...fakeDoc(), ...d }) as any);
    const client = await srv.connect({ auth: { token: signToken("err@test.com") } });
    const got = once(client, "notification");

    await handleInAppNotifications({ type: "payment.failed", recieverEmail: "err@test.com" });

    expect(await got).toMatchObject({ title: "Notification Error", type: "error" });
    expect(create).toHaveBeenCalledTimes(2);
  });
});
