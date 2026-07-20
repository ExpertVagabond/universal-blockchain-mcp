/**
 * Rate limiting — mirrors psm-mcp-core/src/rate_limit.rs 1:1.
 * Sliding window, per-key.
 */

import { PsmMcpError } from "./error.js";

/** Sliding window rate limiter. */
export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly buckets = new Map<string, number[]>();

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /** Default: 60 requests per 60 seconds. */
  static perMinute(): RateLimiter {
    return new RateLimiter(60, 60_000);
  }

  /**
   * Check if a request is allowed for the given key.
   * Throws PsmMcpError.rateLimited() if over limit.
   */
  check(key: string): void {
    const now = Date.now();
    let timestamps = this.buckets.get(key);
    if (!timestamps) {
      timestamps = [];
      this.buckets.set(key, timestamps);
    }

    // Prune expired entries.
    const cutoff = now - this.windowMs;
    while (timestamps.length > 0 && timestamps[0] < cutoff) {
      timestamps.shift();
    }

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const retryAfterMs = this.windowMs - (now - oldest);
      const retryAfterSecs = Math.max(1, Math.ceil(retryAfterMs / 1000));
      throw PsmMcpError.rateLimited(retryAfterSecs);
    }

    timestamps.push(now);
  }

  /** Get current count for a key. */
  count(key: string): number {
    return this.buckets.get(key)?.length ?? 0;
  }

  /** Clear all rate limit state. */
  clear(): void {
    this.buckets.clear();
  }
}
