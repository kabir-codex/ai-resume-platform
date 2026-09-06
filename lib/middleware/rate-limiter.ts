import { NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface RequestWithHeaders {
  headers: Headers;
}

const memoryStore = new Map<string, RateLimitInfo>();

function getKey(req: RequestWithHeaders, prefix: string): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${prefix}:${ip}:${userAgent}`;
}

function cleanupExpiredKeys(): void {
  const now = Date.now();
  for (const [key, info] of memoryStore.entries()) {
    if (info.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredKeys, 60000);

export function rateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(req: RequestWithHeaders): Promise<NextResponse | null> {
    const key = getKey(req, config.keyPrefix);
    const now = Date.now();
    // windowStart = now - config.windowMs; // reserved for future sliding window logic
    void config.windowMs; // suppress unused warning

    let info = memoryStore.get(key);

    if (!info || info.resetTime < now) {
      info = { count: 0, resetTime: now + config.windowMs };
      memoryStore.set(key, info);
    }

    info.count++;

    const remaining = Math.max(0, config.maxRequests - info.count);
    const resetSeconds = Math.ceil((info.resetTime - now) / 1000);

    const headers = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetSeconds.toString(),
    };

    if (info.count > config.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    return null;
  };
}

export const aiRateLimiter = rateLimit({
  windowMs: 60000,
  maxRequests: 10,
  keyPrefix: 'ai',
});

export const authRateLimiter = rateLimit({
  windowMs: 60000,
  maxRequests: 5,
  keyPrefix: 'auth',
});

export const generalRateLimiter = rateLimit({
  windowMs: 60000,
  maxRequests: 60,
  keyPrefix: 'general',
});
