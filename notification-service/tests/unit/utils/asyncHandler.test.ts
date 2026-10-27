import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../../../src/utils/asyncHandler";

describe("asyncHandler", () => {
  const req: any = {}, res: any = {};

  it("runs a sync handler without calling next", async () => {
    const next = vi.fn();
    const h = vi.fn();
    asyncHandler(h)(req, res, next);
    await Promise.resolve();
    expect(h).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards async rejections to next", async () => {
    const next = vi.fn();
    const err = new Error("boom");
    asyncHandler(async () => { throw err; })(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalledWith(err);
  });
});
