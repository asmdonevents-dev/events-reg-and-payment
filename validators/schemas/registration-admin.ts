import { z } from "zod";

export const AdminUpdateRegistrationSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "FAILED", "ATTENDED"]),
  paymentStatus: z.enum(["UNPAID", "PAID", "FREE"]),
  paymentRef: z.string(),
});

export type AdminUpdateRegistrationValues = z.infer<typeof AdminUpdateRegistrationSchema>;
