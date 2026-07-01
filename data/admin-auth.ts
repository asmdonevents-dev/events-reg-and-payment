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

  return {
    id: session.adminId,
    email: session.email,
    role: session.role,
  };
}
