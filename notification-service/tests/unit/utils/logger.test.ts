import { describe, it, expect } from "vitest";
import defaultLogger, { logger } from "../../../src/utils/logger";

describe("logger", () => {
  it("exports the same winston instance as named and default", () => {
    expect(defaultLogger).toBe(logger);
  });

  it("is configured at info level with a console transport", () => {
    expect(logger.level).toBe("info");
    expect(logger.transports).toHaveLength(1);
  });

  it("exposes the usual log methods and does not throw", () => {
    expect(() => {
      logger.info("hello");
      logger.warn("warn");
      logger.error("err", new Error("x"));
    }).not.toThrow();
  });
});
