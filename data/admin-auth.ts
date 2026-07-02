"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  clearAuthCookie,
  getSession,
  setAuthCookie,
  signToken,
} from "@/utils/auth";
import type { AdminLoginValues } from "@/validators/schemas/admin-auth";

export async function loginAdmin(values: AdminLoginValues) {
  try {
    const admin = await prisma.admin.findUnique({ where: { email: values.email } });
    if (!admin) {
      return { success: false as const, error: "Invalid email or password" };
    }

    const valid = await bcrypt.compare(values.password, admin.passwordHash);
    if (!valid) {
      return { success: false as const, error: "Invalid email or password" };
    }

    const token = await signToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    await setAuthCookie(token);

    return { success: true as const };
  } catch (error) {
    console.error("loginAdmin", error);
    return { success: false as const, error: "Login failed" };
  }
}

export async function logoutAdmin() {
  await clearAuthCookie();
  return { success: true as const };
}

export async function getAdminSession() {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      pendingEmail: true,
      emailVerificationExpiresAt: true,
    },
  });

  if (!admin) return null;

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    pendingEmail: admin.pendingEmail,
    emailVerificationPending: Boolean(
      admin.pendingEmail &&
        admin.emailVerificationExpiresAt &&
        admin.emailVerificationExpiresAt > new Date()
    ),
  };
}
