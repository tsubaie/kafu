import { z } from "zod";

export const sendRecognitionSchema = z.object({
  receiver_id: z.string().uuid("Invalid employee ID"),
  credits: z.number().int().min(1, "Minimum 1 credit").max(5, "Maximum 5 credits"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message must be 500 characters or less"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
});

export const leaderboardQuerySchema = z.object({
  period: z.enum(["month", "all-time"]).default("month"),
});

export type SendRecognitionInput = z.infer<typeof sendRecognitionSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
