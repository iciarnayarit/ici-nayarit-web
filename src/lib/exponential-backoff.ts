import { logRetryAttempt } from '@/lib/retry-telemetry';

type BackoffOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  telemetry?: {
    provider: string;
    operation?: string;
  };
};

function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

function computeDelayMs(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exp = Math.min(30, attempt);
  const raw = Math.pow(2, exp) * baseDelayMs;
  return Math.min(maxDelayMs, raw);
}

export async function withExponentialBackoff<T>(
  task: (attempt: number) => Promise<T>,
  options?: BackoffOptions
): Promise<T> {
  const maxRetries = Math.max(0, Math.floor(options?.maxRetries ?? 3));
  const baseDelayMs = Math.max(1, Math.floor(options?.baseDelayMs ?? 120));
  const maxDelayMs = Math.max(baseDelayMs, Math.floor(options?.maxDelayMs ?? 5000));
  const shouldRetry =
    options?.shouldRetry ??
    ((error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error ?? '');
      return /429|5\d\d|timeout|network|fetch|ENOTFOUND|ECONNRESET/i.test(msg);
    });

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }
      const delayMs = computeDelayMs(attempt, baseDelayMs, maxDelayMs);
      if (options?.telemetry?.provider) {
        logRetryAttempt({
          provider: options.telemetry.provider,
          operation: options.telemetry.operation,
          attempt,
          delayMs,
          error,
        });
      }
      await sleep(delayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Reintentos agotados.');
}

