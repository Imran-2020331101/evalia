import { describe, it, expect } from "vitest";
import { ApiResponse } from "../../../src/utils/ApiResponse";

describe("ApiResponse", () => {
  it("marks 2xx as success with default message", () => {
    const r = new ApiResponse(200, { a: 1 });
    expect(r).toMatchObject({ status: 200, data: { a: 1 }, message: "Success", success: true });
    expect(typeof r.timestamp).toBe("string");
  });

  it.each([199, 300, 404, 500])("marks %i as failure", (code) => {
    expect(new ApiResponse(code, null, "nope").success).toBe(false);
  });

  it("treats 299 and 200 as success boundaries", () => {
    expect(new ApiResponse(299, null).success).toBe(true);
  });
});
