import { describe, it, expect } from 'vitest';
import spec from '../../../src/docs/openapi';

describe('openapi spec', () => {
  it('is an OpenAPI 3 document with info and paths', () => {
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info.title).toBeTruthy();
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
  });

  it('every operation declares responses and $refs resolve to components', () => {
    const s: any = spec;
    const refs: string[] = [];
    JSON.stringify(s, (_k, v) => { if (v && typeof v === 'object' && typeof v.$ref === 'string') refs.push(v.$ref); return v; });
    for (const [path, ops] of Object.entries<any>(s.paths)) {
      for (const [method, op] of Object.entries<any>(ops)) {
        expect(op.responses, `${method} ${path}`).toBeTruthy();
      }
    }
    for (const ref of refs) {
      const target = ref.replace(/^#\//, '').split('/').reduce((o: any, k) => o?.[k], s);
      expect(target, ref).toBeDefined();
    }
  });
});
