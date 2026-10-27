import { vi } from 'vitest';

/** Invoke an asyncHandler-wrapped express handler and wait until it responds or calls next(err). */
export async function invoke(handler: (req: any, res: any, next: any) => void, reqOver: any = {}) {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  const req: any = { params: {}, query: {}, body: {}, ...reqOver };
  let settle!: () => void;
  const done = new Promise<void>((r) => (settle = r));
  const next = vi.fn(() => settle());
  res.json.mockImplementation(() => { settle(); return res; });
  handler(req, res, next);
  await done;
  return {
    res, next,
    status: res.status.mock.calls[0]?.[0] as number | undefined,
    body: res.json.mock.calls[0]?.[0] as any,
    error: next.mock.calls[0]?.[0] as any,
  };
}
