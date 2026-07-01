import { z } from "zod";

export type PaymentSettingsFormValues = {
  paystackPublicKey: string;
  paystackSecretKey: string;
};

export const PaymentSettingsSchema = z.object({
  paystackPublicKey: z.string().min(1, "Public key is required"),
  paystackSecretKey: z.string().min(1, "Secret key is required"),
});
