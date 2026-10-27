import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startSocketServer, signToken, once } from "../helpers/testApp";
import { notifyUser, notifyMultipleUsers, broadcastNotification, notifyInterviewUpdate } from "../../src/config/socket";

let srv: Awaited<ReturnType<typeof startSocketServer>>;
beforeAll(async () => { srv = await startSocketServer(); });
afterAll(async () => { await srv.close(); });

const tick = () => new Promise((r) => setTimeout(r, 50));

describe("socket.io authentication (real server)", () => {
  it("accepts token in handshake.auth", async () => {
    const c = await srv.connect({ auth: { token: signToken("a1") } });
    expect(c.connected).toBe(true);
  });

  it("accepts Bearer token in Authorization header", async () => {
    const c = await srv.connect({ extraHeaders: { authorization: `Bearer ${signToken("a2")}` } });
    expect(c.connected).toBe(true);
  });

  it("accepts token cookie", async () => {
    const c = await srv.connect({ extraHeaders: { cookie: `x=1; token=${signToken("a3")}` } });
    expect(c.connected).toBe(true);
  });

  it("rejects connections with no credentials", async () => {
    await expect(srv.connect()).rejects.toMatchObject({ message: "Authentication required" });
  });

  it("rejects invalid / wrong-secret tokens", async () => {
    await expect(srv.connect({ auth: { token: "junk" } })).rejects.toMatchObject({ message: "Invalid token" });
    await expect(srv.connect({ auth: { token: signToken("x", "other-secret") } })).rejects.toMatchObject({ message: "Invalid token" });
  });
});

describe("notification emitters (real server)", () => {
  it("notifyUser reaches only the targeted user", async () => {
    const a = await srv.connect({ auth: { token: signToken("ua") } });
    const b = await srv.connect({ auth: { token: signToken("ub") } });
    let bGot = false;
    b.on("notification", () => (bGot = true));
    const p = once(a, "notification");
    notifyUser("ua", { hello: 1 });
    expect(await p).toEqual({ hello: 1 });
    await tick();
    expect(bGot).toBe(false);
  });

  it("notifyMultipleUsers reaches each listed user", async () => {
    const a = await srv.connect({ auth: { token: signToken("m1") } });
    const b = await srv.connect({ auth: { token: signToken("m2") } });
    const pa = once(a, "notification"), pb = once(b, "notification");
    notifyMultipleUsers(["m1", "m2"], { n: 2 });
    expect(await Promise.all([pa, pb])).toEqual([{ n: 2 }, { n: 2 }]);
  });

  it("broadcastNotification reaches everyone", async () => {
    const a = await srv.connect({ auth: { token: signToken("b1") } });
    const b = await srv.connect({ auth: { token: signToken("b2") } });
    const pa = once(a, "notification"), pb = once(b, "notification");
    broadcastNotification({ all: true });
    expect(await Promise.all([pa, pb])).toEqual([{ all: true }, { all: true }]);
  });

  it("notifyInterviewUpdate uses the interview-notification event", async () => {
    const a = await srv.connect({ auth: { token: signToken("iv") } });
    const p = once(a, "interview-notification");
    notifyInterviewUpdate("iv", { type: "INTERVIEW_SCHEDULED" });
    expect(await p).toEqual({ type: "INTERVIEW_SCHEDULED" });
  });
});
