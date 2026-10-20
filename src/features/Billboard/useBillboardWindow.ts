import { useEffect, useReducer } from 'react';

import type { GlobalBillboard } from '@/types/serverConfig';

const MAX_TIMEOUT = 2_147_483_647;

/** Update at schedule boundaries even when no server response changes the store. */
export const useBillboardWindow = (billboard: GlobalBillboard | null | undefined): boolean => {
  const [, update] = useReducer((value: number) => value + 1, 0);
  const start = Date.parse(billboard?.startAt ?? '');
  const end = Date.parse(billboard?.endAt ?? '');

  useEffect(() => {
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      clearTimeout(timer);
      const now = Date.now();
      const boundary = now < start ? start : end + 1;
      if (boundary > now) timer = setTimeout(refresh, Math.min(boundary - now, MAX_TIMEOUT));
    };
    const refresh = () => {
      update();
      schedule();
    };

    schedule();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [start, end]);

  const now = Date.now();
  return (
    Number.isFinite(start) && Number.isFinite(end) && start < end && start <= now && now <= end
  );
};
