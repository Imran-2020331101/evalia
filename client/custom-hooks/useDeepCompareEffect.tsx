import { useEffect, useRef } from "react";
import isEqual from "lodash.isequal";

function useDeepCompareMemoize<T>(value: T): T {
  const ref = useRef<T>(value);

  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Works like useEffect but does deep comparison on dependencies.
 */
export function useDeepCompareEffect(
  effect: React.EffectCallback,
  deps: any[]
): void {
  // Replace each dependency with its memoized version
  const memoizedDeps = deps.map(useDeepCompareMemoize);
  useEffect(effect, memoizedDeps);
}
