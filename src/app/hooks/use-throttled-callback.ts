'use client';

import { useCallback, useRef } from 'react';

export function useThrottledCallback<T extends (...args: any[]) => void>(callback: T, waitMs = 80): T {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const lastArgsRef = useRef<any[] | null>(null);

  return useCallback((...args: any[]) => {
    const now = Date.now();
    const elapsed = now - lastRunRef.current;

    const run = () => {
      lastRunRef.current = Date.now();
      timeoutRef.current = null;
      callback(...(lastArgsRef.current ?? args));
      lastArgsRef.current = null;
    };

    if (elapsed >= waitMs && timeoutRef.current === null) {
      lastArgsRef.current = args;
      run();
      return;
    }

    lastArgsRef.current = args;
    if (timeoutRef.current !== null) return;
    timeoutRef.current = window.setTimeout(run, Math.max(0, waitMs - elapsed));
  }, [callback, waitMs]) as T;
}

