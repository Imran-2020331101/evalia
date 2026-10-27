import { it, expect } from 'vitest';
import { asKey, concretize, resolveRoute, type ExpressRoute, type ProxyEndpoint } from './contract.js';

/**
 * Registers one test per gateway endpoint asserting that the downstream Express router
 * serves it. Endpoints listed in `knownMismatches` are asserted to be STILL broken, so the
 * suite stays green but flags (by failing) the moment someone fixes the drift and the
 * entry should be removed.
 */
export function assertEndpoints(
  endpoints: ProxyEndpoint[],
  routes: ExpressRoute[],
  knownMismatches: Record<string, string> = {},
) {
  for (const ep of endpoints) {
    const key = asKey(ep);
    const found = resolveRoute(routes, ep.method, concretize(ep.path));
    if (knownMismatches[key]) {
      it(`KNOWN MISMATCH ${key} (${ep.javaMethod}): ${knownMismatches[key]}`, () => {
        expect(found, 'mismatch appears fixed - remove it from knownMismatches').toBeUndefined();
      });
    } else {
      it(`${key} (${ep.javaMethod}) is served downstream`, () => {
        expect(found, `no downstream route for ${key}`).toBeDefined();
      });
    }
  }
}
