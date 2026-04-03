import { describe, it, expect } from "vitest";
import { sendRecognitionSchema, registerSchema, leaderboardQuerySchema } from "@/lib/validations";

describe("sendRecognitionSchema", () => {
  const validData = {
    receiver_id: "550e8400-e29b-41d4-a716-446655440000",
    credits: 1,
    badge: "شقردي" as const,
    message: "شكراً على مساعدتك",
  };

  it("accepts valid recognition data", () => {
    const result = sendRecognitionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts empty message (optional)", () => {
    const { message: _, ...withoutMessage } = validData;
    const result = sendRecognitionSchema.safeParse(withoutMessage);
    expect(result.success).toBe(true);
  });

  it("accepts all valid badge types", () => {
    const badges = ["شقردي", "هب ريح", "فزعة", "متعاون", "فنّان"] as const;
    for (const badge of badges) {
      const result = sendRecognitionSchema.safeParse({ ...validData, badge });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid badge", () => {
    const result = sendRecognitionSchema.safeParse({ ...validData, badge: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for receiver_id", () => {
    const result = sendRecognitionSchema.safeParse({ ...validData, receiver_id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects credits below 1", () => {
    const result = sendRecognitionSchema.safeParse({ ...validData, credits: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects credits above 5", () => {
    const result = sendRecognitionSchema.safeParse({ ...validData, credits: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects message over 500 characters", () => {
    const result = sendRecognitionSchema.safeParse({ ...validData, message: "أ".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("accepts message at exactly 500 characters", () => {
    const result = sendRecognitionSchema.safeParse({ ...validData, message: "أ".repeat(500) });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  const validData = {
    name: "سارة الراشد",
    email: "sarah@adaa.gov.sa",
    password: "password123",
    department: "الهندسة",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short password (under 6 chars)", () => {
    const result = registerSchema.safeParse({ ...validData, password: "12345" });
    expect(result.success).toBe(false);
  });

  it("accepts password at exactly 6 characters", () => {
    const result = registerSchema.safeParse({ ...validData, password: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects empty department", () => {
    const result = registerSchema.safeParse({ ...validData, department: "" });
    expect(result.success).toBe(false);
  });
});

describe("leaderboardQuerySchema", () => {
  it("defaults period to month", () => {
    const result = leaderboardQuerySchema.parse({});
    expect(result.period).toBe("month");
  });

  it("accepts month period", () => {
    const result = leaderboardQuerySchema.parse({ period: "month" });
    expect(result.period).toBe("month");
  });

  it("accepts all-time period", () => {
    const result = leaderboardQuerySchema.parse({ period: "all-time" });
    expect(result.period).toBe("all-time");
  });

  it("rejects invalid period", () => {
    const result = leaderboardQuerySchema.safeParse({ period: "week" });
    expect(result.success).toBe(false);
  });
});
