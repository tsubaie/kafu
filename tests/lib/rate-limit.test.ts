import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("rate-limit", () => {
  const key = "test-user@example.com";

  beforeEach(() => {
    resetRateLimit(key);
  });

  it("allows first attempt", () => {
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("decrements remaining on each attempt", () => {
    checkRateLimit(key);
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it("blocks after 5 attempts", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key);
    }
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets rate limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key);
    }
    resetRateLimit(key);
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key);
    }
    const blocked = checkRateLimit(key);
    expect(blocked.allowed).toBe(false);

    const otherKey = "other@example.com";
    const allowed = checkRateLimit(otherKey);
    expect(allowed.allowed).toBe(true);
    resetRateLimit(otherKey);
  });
});
