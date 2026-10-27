import { describe, it, expect, vi } from "vitest";

const m = vi.hoisted(() => {
  const server = { listen: vi.fn((_p: any, cb: () => void) => cb()) };
  const io = { listen: vi.fn() };
  return { server, io, createServer: vi.fn(() => server), initSocket: vi.fn(() => io) };
});
vi.mock("http", () => ({ default: { createServer: m.createServer }, createServer: m.createServer }));
vi.mock("../../src/app", () => ({ default: "APP" }));
vi.mock("../../src/config/socket", () => ({ initSocket: m.initSocket }));

describe("server bootstrap", () => {
  it("wires http server, socket.io and listens on env.PORT", async () => {
    await import("../../src/server");
    expect(m.createServer).toHaveBeenCalledWith("APP");
    expect(m.initSocket).toHaveBeenCalledWith(m.server);
    expect(m.io.listen).toHaveBeenCalledWith(6001);
    expect(m.server.listen).toHaveBeenCalledWith(6000, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith("Notification service running on port 6000");
  });
});
