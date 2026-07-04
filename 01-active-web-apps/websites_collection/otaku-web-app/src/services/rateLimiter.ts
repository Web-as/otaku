interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private maxRequests = 90; // AniList allows 90 requests per minute
  private windowMs = 60 * 1000; // 1 minute

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      const waitTime = entry.resetAt - now;
      console.warn(`Rate limit reached for ${key}. Wait ${Math.ceil(waitTime / 1000)}s`);
      return false;
    }

    entry.count++;
    return true;
  }

  async waitForLimit(key: string): Promise<void> {
    const entry = this.limits.get(key);
    if (!entry) return;

    const now = Date.now();
    if (entry.count >= this.maxRequests && now < entry.resetAt) {
      const waitTime = entry.resetAt - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.limits.delete(key);
    }
  }

  reset(key: string): void {
    this.limits.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
