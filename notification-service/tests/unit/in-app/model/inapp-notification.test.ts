import { describe, it, expect } from "vitest";
import { Notification } from "../../../../src/in-app/model/inapp-notification";

const valid = { recieverId: "u", recieverEmail: "u@t.c", title: "t", message: "m", type: "info" };

describe("Notification model (no DB connection)", () => {
  it("is registered under the name Notification", () => {
    expect(Notification.modelName).toBe("Notification");
  });

  it("accepts a valid document and applies defaults", () => {
    const d = new Notification(valid);
    expect(d.validateSync()).toBeUndefined();
    expect(d.isRead).toBe(false);
    expect(d.createdAt).toBeInstanceOf(Date);
  });

  it.each(["recieverId", "recieverEmail", "title", "message", "type"])("requires %s", (f) => {
    const d = new Notification({ ...valid, [f]: undefined });
    expect(d.validateSync()?.errors[f]).toBeDefined();
  });

  it("allows optional link and arbitrary data", () => {
    const d = new Notification({ ...valid, link: "/x", data: { a: [1, { b: 2 }] } });
    expect(d.validateSync()).toBeUndefined();
    expect(d.data).toEqual({ a: [1, { b: 2 }] });
  });
});
