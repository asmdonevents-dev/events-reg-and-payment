"use client";

import { useMutation, useQuery, useQueryClient } from "react-query";
import { getPaymentSettings, upsertPaymentSettings } from "@/data/payment-settings";
import type { PaymentSettingsFormValues } from "@/validators/schemas/payment-settings";

export const PAYMENT_SETTINGS_KEYS = {
  all: ["payment-settings"] as const,
  detail: ["payment-settings", "detail"] as const,
};

export function usePaymentSettings() {
  return useQuery(PAYMENT_SETTINGS_KEYS.detail, getPaymentSettings);
}

export function useUpsertPaymentSettings() {
  const queryClient = useQueryClient();
  return useMutation((data: PaymentSettingsFormValues) => upsertPaymentSettings(data), {
    onSuccess: () => queryClient.invalidateQueries(PAYMENT_SETTINGS_KEYS.all),
  });
}
