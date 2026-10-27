import { describe, it, expect } from "vitest";
import { ApiError } from "../../../src/utils/ApiError";

describe("ApiError", () => {
  it("sets defaults", () => {
    const e = new ApiError(400);
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(400);
    expect(e.message).toBe("Something went wrong");
    expect(e.errors).toEqual([]);
    expect(e.data).toBeNull();
    expect(e.success).toBe(false);
    expect(e.stack).toBeTruthy();
  });

  it("keeps provided message, errors and custom stack", () => {
    const e = new ApiError(422, "bad", ["x"], "custom-stack");
    expect(e.message).toBe("bad");
    expect(e.errors).toEqual(["x"]);
    expect(e.stack).toBe("custom-stack");
  });
});
