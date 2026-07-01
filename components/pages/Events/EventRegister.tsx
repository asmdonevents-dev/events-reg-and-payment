"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import PublicLayoutShell from "@/components/pages/layout/shell";
import BackButton from "@/components/custom/back-button";
import DynamicRegistrationForm from "@/components/custom/dynamic-registration-form";
import { ButtonSpinner } from "@/components/custom/spinner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventBySlug } from "@/hooks/use-events";
import { useCreateRegistration } from "@/hooks/use-registrations";
import type { DynamicRegistrationValues } from "@/validators/schemas/registration";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function EventRegisterPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: event, isLoading } = useEventBySlug(slug);
  const { mutateAsync: createRegistration, isLoading: isSubmitting } =
    useCreateRegistration();

  async function onSubmit(values: DynamicRegistrationValues) {
    if (!event) return;

    try {
      const result = await createRegistration({
        responses: values,
        eventId: event.id,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Registration failed");
        return;
      }

      if (result.requiresPayment) {
        const paymentResponse = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId: result.data.id }),
        });

        const paymentData = (await paymentResponse.json()) as {
          paymentUrl?: string;
          error?: string;
        };

        if (!paymentResponse.ok || !paymentData.paymentUrl) {
          toast.error(paymentData.error ?? "Failed to start payment");
          return;
        }

        window.location.href = paymentData.paymentUrl;
        return;
      }

      router.push(
        `/events/${slug}/confirmation?ref=${result.data.id}&status=success`,
      );
    } catch {
      toast.error("Registration failed");
    }
  }

  if (isLoading || !event) {
    return (
      <PublicLayoutShell>
        <div className="mx-auto max-w-xl px-4 py-10">
          <Skeleton className="mb-6 h-32 w-full" />
          <Skeleton className="-mt-12 h-96 w-full rounded-2xl" />
        </div>
      </PublicLayoutShell>
    );
  }

  return (
    <PublicLayoutShell>
      <div className="relative">
        <div className="mx-auto max-w-xl px-4 pb-20 pt-6 sm:pb-24">
          <BackButton label="event" href={`/events/${slug}`} />

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                Register for {event.title}
              </h1>
              <Badge className="shrink-0">
                {event.isFree ? "Free" : formatCurrency(event.ticketPrice ?? 0)}
              </Badge>
            </div>

            <p className="max-w-lg text-sm text-muted-foreground">
              {event.isFree
                ? "Complete the form below to confirm your seat."
                : `Secure your spot — ticket price ${formatCurrency(event.ticketPrice ?? 0)}.`}
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-xl px-4 -mt-16 pb-10 sm:-mt-20">
          <Card className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-xl ring-1 ring-border/40">
            <div
              className="h-1 bg-linear-to-r from-asm-lime-green via-asm-lime-green/80 to-asm-terracotta"
              aria-hidden
            />
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <CardTitle className="text-xl">Registration form</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {event.formFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Registration is not available for this event yet.
                </p>
              ) : (
                <DynamicRegistrationForm
                  fields={event.formFields}
                  onSubmit={onSubmit}
                >
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <ButtonSpinner label="Submitting..." />
                      ) : event.isFree ? (
                        "Confirm registration"
                      ) : (
                        "Continue to payment"
                      )}
                    </Button>
                    <Link
                      href={`/events/${slug}`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "inline-flex",
                      )}
                    >
                      Cancel
                    </Link>
                  </div>
                </DynamicRegistrationForm>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayoutShell>
  );
}
