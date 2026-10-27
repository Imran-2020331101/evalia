import { vi } from "vitest";

/**
 * Chainable, awaitable stand-in for a mongoose Query. No database needed.
 * `orFail()` mimics mongoose: rejects with DocumentNotFoundError on null result.
 */
export function mockQuery(result: any, opts: { reject?: Error } = {}) {
  let failIfEmpty = false;
  const q: any = {
    sort: vi.fn(() => q),
    orFail: vi.fn(() => {
      failIfEmpty = true;
      return q;
    }),
    then(resolve: any, reject: any) {
      let p: Promise<any>;
      if (opts.reject) p = Promise.reject(opts.reject);
      else if (failIfEmpty && (result === null || result === undefined)) {
        const e = new Error("No document found for query");
        e.name = "DocumentNotFoundError";
        p = Promise.reject(e);
      } else p = Promise.resolve(result);
      return p.then(resolve, reject);
    },
  };
  return q;
}

export const fakeDoc = (over: any = {}) => ({
  _id: "n1",
  recieverId: "u1",
  recieverEmail: "u1@test.com",
  title: "t",
  message: "m",
  type: "info",
  isRead: false,
  createdAt: new Date("2030-01-01T00:00:00Z"),
  ...over,
});
