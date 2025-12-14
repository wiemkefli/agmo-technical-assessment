import { useEffect } from "react";

export type AsyncEffectContext = {
  signal: AbortSignal;
  isActive: () => boolean;
};

export function useAsyncEffect(
  effect: (ctx: AsyncEffectContext) => void | Promise<void>,
  deps: React.DependencyList,
) {
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void effect({
      signal: controller.signal,
      isActive: () => active,
    });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

