const listeners = new Set<() => void>();
let revision = 0;

/** A consumption boundary only invalidates the balance; listeners decide when to query it. */
export const notifySmaiUsageChanged = (provider?: string): void => {
  if (provider !== 'smai') return;

  revision += 1;
  for (const listener of listeners) {
    try {
      listener();
    } catch (error) {
      console.error('[HomeUsage] Usage change listener failed:', error);
    }
  }
};

export const subscribeSmaiUsageChanged = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getSmaiUsageRevision = (): number => revision;
