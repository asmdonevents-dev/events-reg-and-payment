"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/admin/header/pagebreadcrumb";
import PageHeader from "@/components/admin/header/pageHeader";
import { ButtonSpinner } from "@/components/custom/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePaymentSettings, useUpsertPaymentSettings } from "@/hooks/use-payment-settings";
import {
  PaymentSettingsSchema,
  type PaymentSettingsFormValues,
} from "@/validators/schemas/payment-settings";

export default function PaymentSettingsForm() {
  const { data: settings, isLoading } = usePaymentSettings();
  const { mutateAsync: saveSettings, isLoading: isSaving } = useUpsertPaymentSettings();

  const form = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(PaymentSettingsSchema),
    defaultValues: {
      paystackPublicKey: "",
      paystackSecretKey: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        paystackPublicKey: settings.paystackPublicKey,
        paystackSecretKey: settings.paystackSecretKey,
      });
    }
  }, [settings, form]);

  async function onSubmit(values: PaymentSettingsFormValues) {
    const result = await saveSettings(values);
    if (!result.success) {
      toast.error(result.error ?? "Failed to save settings");
      return;
    }
    toast.success("Payment settings saved");
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageBreadcrumb />
      <PageHeader
        title="Payment Settings"
        description="Configure Paystack keys for paid event registrations."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Paystack configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="paystackPublicKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public key</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="pk_test_..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paystackSecretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret key</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="sk_test_..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <ButtonSpinner label="Saving..." /> : "Save settings"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
