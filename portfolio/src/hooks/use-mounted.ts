import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True once the component has hydrated on the client. Avoids SSR/client markup mismatches without a state-setting effect. */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
