import { z } from "zod";

export const UpdateAdminNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
});

export const RequestAdminEmailChangeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const VerifyAdminEmailChangeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Enter the 6-digit verification code")
    .regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const ChangeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UpdateAdminRoleSchema = z.object({
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export type UpdateAdminNameValues = z.infer<typeof UpdateAdminNameSchema>;
export type RequestAdminEmailChangeValues = z.infer<typeof RequestAdminEmailChangeSchema>;
export type VerifyAdminEmailChangeValues = z.infer<typeof VerifyAdminEmailChangeSchema>;
export type ChangeAdminPasswordValues = z.infer<typeof ChangeAdminPasswordSchema>;
export type UpdateAdminRoleValues = z.infer<typeof UpdateAdminRoleSchema>;
