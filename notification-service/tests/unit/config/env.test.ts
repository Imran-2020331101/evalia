import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("dotenv", () => ({ default: { config: vi.fn() } }));

const KEYS = ["PORT","MONGO_URI","BROKER_URL","JWT_SECRET","SMTP_HOST","SMTP_PORT","SMTP_SECURE","SMTP_USER","SMTP_PASS","FROM_EMAIL","FROM_NAME","AI_SERVER_URL","UPSKILL_ENGINE_URL"];
let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  vi.resetModules();
});
afterEach(() => {
  KEYS.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k])));
});

describe("env", () => {
  it("falls back to defaults", async () => {
    KEYS.forEach((k) => delete process.env[k]);
    const { env } = await import("../../../src/config/env");
    expect(env).toEqual({
      PORT: 6000, MONGO_URI: "", BROKER_URL: "", JWT_SECRET: "change-me",
      SMTP_HOST: "smtp.gmail.com", SMTP_PORT: 587, SMTP_SECURE: false,
      SMTP_USER: "", SMTP_PASS: "", FROM_EMAIL: "noreply@evalia.com", FROM_NAME: "Evalia Team",
      AI_SERVER_URL: "http://localhost:5000", UPSKILL_ENGINE_URL: "http://localhost:7000",
    });
  });

  it("reads values from process.env", async () => {
    Object.assign(process.env, {
      PORT: "9000", MONGO_URI: "m", BROKER_URL: "b", JWT_SECRET: "s", SMTP_HOST: "h",
      SMTP_PORT: "2525", SMTP_SECURE: "true", SMTP_USER: "u", SMTP_PASS: "p",
      FROM_EMAIL: "f@x", FROM_NAME: "F", AI_SERVER_URL: "ai", UPSKILL_ENGINE_URL: "up",
    });
    const { env } = await import("../../../src/config/env");
    expect(env).toMatchObject({ PORT: "9000", SMTP_PORT: 2525, SMTP_SECURE: true, JWT_SECRET: "s", AI_SERVER_URL: "ai" });
  });
});
