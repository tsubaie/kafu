import { z } from "zod";

export const sendRecognitionSchema = z.object({
  receiver_id: z.string().uuid("معرّف الموظف غير صالح"),
  credits: z.number().int().min(1, "الحد الأدنى رصيد واحد").max(5, "الحد الأقصى ٥ أرصدة"),
  message: z
    .string()
    .min(1, "الرسالة مطلوبة")
    .max(500, "يجب ألا تتجاوز الرسالة ٥٠٠ حرف"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").max(100),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون ٦ أحرف على الأقل"),
  department: z.string().min(1, "الإدارة مطلوبة"),
});

export const leaderboardQuerySchema = z.object({
  period: z.enum(["month", "all-time"]).default("month"),
});

export type SendRecognitionInput = z.infer<typeof sendRecognitionSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
