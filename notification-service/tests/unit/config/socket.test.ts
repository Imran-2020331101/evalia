import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

const h = vi.hoisted(() => ({
  ctor: vi.fn(), use: vi.fn(), on: vi.fn(), to: vi.fn(), emit: vi.fn(), roomEmit: vi.fn(),
}));

vi.mock("socket.io", () => ({
  Server: class {
    constructor(...a: any[]) { h.ctor(...a); }
    use = h.use; on = h.on; to = h.to; emit = h.emit;
  },
}));

const tok = (sub = "u1") => jwt.sign({ sub }, "test-secret");

async function load() {
  vi.resetModules();
  return import("../../../src/config/socket");
}

beforeEach(() => {
  h.to.mockReturnValue({ emit: h.roomEmit });
});

describe("notify helpers before initSocket", () => {
  it("warn and do not emit", async () => {
    const s = await load();
    s.notifyUser("u", {});
    s.notifyMultipleUsers(["a"], {});
    s.broadcastNotification({});
    s.notifyInterviewUpdate("u", {});
    expect(console.warn).toHaveBeenCalledTimes(4);
    expect(h.to).not.toHaveBeenCalled();
    expect(h.emit).not.toHaveBeenCalled();
  });
});

describe("initSocket", () => {
  const setup = async () => {
    const s = await load();
    const io = s.initSocket({} as any);
    const mw = h.use.mock.calls[0][0];
    return { s, io, mw };
  };
  const sock = (handshake: any = {}) => ({ handshake: { auth: {}, headers: {}, ...handshake }, data: {} as any, join: vi.fn() });

  it("creates the Server with cors options and registers middleware + connection handler", async () => {
    await setup();
    expect(h.ctor.mock.calls[0][1].cors).toMatchObject({ credentials: true });
    expect(h.on).toHaveBeenCalledWith("connection", expect.any(Function));
    const onConn = h.on.mock.calls[0][1];
    onConn({ data: { userId: "u1" } });
    expect(console.log).toHaveBeenCalledWith("User connected: u1");
  });

  it("authenticates by handshake.auth.token", async () => {
    const { mw } = await setup();
    const s = sock({ auth: { token: tok("abc") } }), next = vi.fn();
    mw(s, next);
    expect(next).toHaveBeenCalledWith();
    expect(s.data.userId).toBe("abc");
    expect(s.join).toHaveBeenCalledWith("abc");
  });

  it("authenticates by Bearer header", async () => {
    const { mw } = await setup();
    const s = sock({ headers: { authorization: `Bearer ${tok("hdr")}` } }), next = vi.fn();
    mw(s, next);
    expect(s.data.userId).toBe("hdr");
    expect(next).toHaveBeenCalledWith();
  });

  it("ignores non-Bearer authorization headers", async () => {
    const { mw } = await setup();
    const next = vi.fn();
    mw(sock({ headers: { authorization: `Basic xyz` } }), next);
    expect(next.mock.calls[0][0].message).toBe("Authentication required");
  });

  it("authenticates by cookie", async () => {
    const { mw } = await setup();
    const s = sock({ headers: { cookie: `a=1; token=${tok("ck")}; b=2` } }), next = vi.fn();
    mw(s, next);
    expect(s.data.userId).toBe("ck");
  });

  it("rejects when cookie has no token", async () => {
    const { mw } = await setup();
    const next = vi.fn();
    mw(sock({ headers: { cookie: "a=1; b=2" } }), next);
    expect(next.mock.calls[0][0].message).toBe("Authentication required");
  });

  it("rejects when no token anywhere", async () => {
    const { mw } = await setup();
    const next = vi.fn();
    mw(sock(), next);
    expect(next.mock.calls[0][0].message).toBe("Authentication required");
  });

  it("rejects invalid token", async () => {
    const { mw } = await setup();
    const next = vi.fn(), s = sock({ auth: { token: "garbage" } });
    mw(s, next);
    expect(next.mock.calls[0][0].message).toBe("Invalid token");
    expect(s.join).not.toHaveBeenCalled();
  });

  it("handles missing auth object", async () => {
    const { mw } = await setup();
    const next = vi.fn();
    mw({ handshake: { headers: {} }, data: {}, join: vi.fn() }, next);
    expect(next.mock.calls[0][0].message).toBe("Authentication required");
  });
});

describe("notify helpers after initSocket", () => {
  it("notifyUser emits to the user's room", async () => {
    const s = await load(); s.initSocket({} as any);
    s.notifyUser("u1", { a: 1 });
    expect(h.to).toHaveBeenCalledWith("u1");
    expect(h.roomEmit).toHaveBeenCalledWith("notification", { a: 1 });
  });

  it("notifyMultipleUsers emits once per user", async () => {
    const s = await load(); s.initSocket({} as any);
    s.notifyMultipleUsers(["a", "b", "c"], { x: 1 });
    expect(h.to.mock.calls.map((c) => c[0])).toEqual(["a", "b", "c"]);
    expect(h.roomEmit).toHaveBeenCalledTimes(3);
  });

  it("broadcastNotification emits to all", async () => {
    const s = await load(); s.initSocket({} as any);
    s.broadcastNotification({ y: 1 });
    expect(h.emit).toHaveBeenCalledWith("notification", { y: 1 });
  });

  it("notifyInterviewUpdate uses the interview-notification event", async () => {
    const s = await load(); s.initSocket({} as any);
    s.notifyInterviewUpdate("u9", { z: 1 });
    expect(h.to).toHaveBeenCalledWith("u9");
    expect(h.roomEmit).toHaveBeenCalledWith("interview-notification", { z: 1 });
  });
});
