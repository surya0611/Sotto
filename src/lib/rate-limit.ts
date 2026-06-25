type RateLimitInfo = {
  count: number;
  resetTime: number;
};

// In-memory store for rate limiting
// Note: In serverless environments, this is scoped per lambda instance.
// For global rate limiting, use Upstash Redis or Vercel KV.
const rateLimitCache = new Map<string, RateLimitInfo>();

/**
 * Basic in-memory rate limiter using a fixed window
 * @param identifier e.g., IP address or session ID
 * @param limit Max requests per window
 * @param windowMs Time window in milliseconds
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = rateLimitCache.get(identifier);

  // Clean up old entries occasionally to prevent memory leaks in long-running instances
  if (Math.random() < 0.01) {
    for (const [key, info] of rateLimitCache.entries()) {
      if (info.resetTime < now) {
        rateLimitCache.delete(key);
      }
    }
  }

  if (!current || current.resetTime < now) {
    // First request or window expired
    rateLimitCache.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  // Still within window
  current.count += 1;
  
  if (current.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: current.resetTime,
    };
  }

  return {
    success: true,
    limit,
    remaining: limit - current.count,
    reset: current.resetTime,
  };
}
