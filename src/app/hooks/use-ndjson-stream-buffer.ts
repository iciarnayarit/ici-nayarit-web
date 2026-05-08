'use client';

import { useCallback, useEffect, useRef } from 'react';

type UseNdjsonStreamBufferOptions<T> = {
  flushMs?: number;
  parseLine?: (line: string) => T | null;
  onFlush: (events: T[]) => void;
};

export function useNdjsonStreamBuffer<T>(options: UseNdjsonStreamBufferOptions<T>) {
  const flushMs = options.flushMs ?? 120;
  const parseLine = options.parseLine ?? ((line: string) => JSON.parse(line) as T);

  const queueRef = useRef<T[]>([]);
  const timerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const onFlushRef = useRef(options.onFlush);

  useEffect(() => {
    onFlushRef.current = options.onFlush;
  }, [options.onFlush]);

  const flushNow = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const chunk = queueRef.current.splice(0, queueRef.current.length);
    onFlushRef.current(chunk);
  }, []);

  const scheduleFlush = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (cancelledRef.current) return;
      flushNow();
    }, Math.max(16, flushMs));
  }, [flushMs, flushNow]);

  const reset = useCallback(() => {
    cancelledRef.current = false;
    queueRef.current = [];
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const consumeResponse = useCallback(
    async (res: Response) => {
      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let carry = '';
      while (!cancelledRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        carry += decoder.decode(value, { stream: true });
        const lines = carry.split('\n');
        carry = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = parseLine(trimmed);
            if (event == null) continue;
            queueRef.current.push(event);
            scheduleFlush();
          } catch {
            // Ignorar líneas parciales/no parseables
          }
        }
      }
      if (carry.trim()) {
        try {
          const event = parseLine(carry.trim());
          if (event != null) queueRef.current.push(event);
        } catch {
          // ignore
        }
      }
      flushNow();
    },
    [flushNow, parseLine, scheduleFlush]
  );

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return {
    consumeResponse,
    flushNow,
    reset,
    cancel,
  };
}

