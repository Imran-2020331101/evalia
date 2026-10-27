import { describe, it, expect, vi, afterEach } from "vitest";
import { errorHandler, notFoundHandler } from "../../../src/middleware";
import { ApiError } from "../../../src/utils/ApiError";

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};
const req: any = { url: "/x", method: "GET", ip: "1.1.1.1", get: vi.fn(() => "UA") };

describe("errorHandler", () => {
  afterEach(() => { process.env.NODE_ENV = "test"; });

  it("passes ApiError through", () => {
    const res = mockRes();
    errorHandler(new ApiError(418, "teapot"), req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(418);
    const body = res.json.mock.calls[0][0];
    expect(body.response).toMatchObject({ status: 418, message: "teapot", data: null, success: false });
    expect(body.stack).toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it("wraps generic errors using their statusCode", () => {
    const res = mockRes();
    const e: any = new Error("custom");
    e.statusCode = 400;
    errorHandler(e, req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].response.message).toBe("custom");
  });

  it("defaults to 500 and generic message", () => {
    const res = mockRes();
    errorHandler({}, req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].response.message).toBe("Something went wrong");
  });

  it("includes stack in development", () => {
    process.env.NODE_ENV = "development";
    const res = mockRes();
    errorHandler(new ApiError(500, "x", [], "STACK"), req, res, vi.fn());
    expect(res.json.mock.calls[0][0].stack).toBe("STACK");
  });
});

describe("notFoundHandler", () => {
  it("forwards a 404 ApiError containing the URL", () => {
    const next = vi.fn();
    notFoundHandler({ originalUrl: "/nope" } as any, mockRes(), next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Route /nope not found");
  });
});
