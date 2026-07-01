"use server";

import { prisma } from "@/lib/prisma";
import type { PaymentSettingsFormValues } from "@/validators/schemas/payment-settings";

export async function getPaymentSettings() {
  return prisma.paymentSettings.findUnique({ where: { id: "default" } });
}

export async function upsertPaymentSettings(data: PaymentSettingsFormValues) {
  try {
    const settings = await prisma.paymentSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        paystackPublicKey: data.paystackPublicKey,
        paystackSecretKey: data.paystackSecretKey,
      },
      update: {
        paystackPublicKey: data.paystackPublicKey,
        paystackSecretKey: data.paystackSecretKey,
      },
    });

    return { success: true as const, data: settings };
  } catch (error) {
    console.error("upsertPaymentSettings", error);
    return { success: false as const, error: "Failed to save payment settings" };
  }
}

export async function getPaymentSettingsForServer() {
  const settings = await getPaymentSettings();

  if (settings) return settings;

  if (process.env.PAYSTACK_PUBLIC_KEY && process.env.PAYSTACK_SECRET_KEY) {
    return {
      id: "default",
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
      updatedAt: new Date(),
    };
  }

  return null;
}
