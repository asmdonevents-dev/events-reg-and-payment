import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginValues = z.infer<typeof AdminLoginSchema>;
