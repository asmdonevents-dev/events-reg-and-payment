import { NextResponse } from "next/server";
import { updateRegistrationStatus } from "@/data/registrations";
import { getPaymentSettingsForServer } from "@/data/payment-settings";
import { verifyPaystackPayment } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const registrationId = searchParams.get("registrationId");
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref");

  if (!registrationId) {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: { event: true },
  });

  if (!registration) {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  const confirmationUrl = new URL(
    `/events/${registration.event.slug}/confirmation`,
    request.url
  );
  confirmationUrl.searchParams.set("ref", registration.id);

  if (!reference) {
    await updateRegistrationStatus(registration.id, {
      status: "FAILED",
      paymentStatus: "UNPAID",
    });
    confirmationUrl.searchParams.set("status", "failed");
    return NextResponse.redirect(confirmationUrl);
  }

  try {
    const settings = await getPaymentSettingsForServer();
    if (!settings) {
      confirmationUrl.searchParams.set("status", "failed");
      return NextResponse.redirect(confirmationUrl);
    }

    const verification = await verifyPaystackPayment(
      reference,
      settings.paystackSecretKey
    );

    const expectedAmount = Math.round(Number(registration.amount) * 100);
    const payment = verification.data;
    const isSuccessful =
      verification.success &&
      payment?.status === "success" &&
      payment.reference === registration.paymentRef &&
      payment.amount === expectedAmount;

    if (isSuccessful && payment) {
      await updateRegistrationStatus(registration.id, {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentRef: payment.reference,
      });
      confirmationUrl.searchParams.set("status", "success");
    } else {
      await updateRegistrationStatus(registration.id, {
        status: "FAILED",
        paymentStatus: "UNPAID",
      });
      confirmationUrl.searchParams.set("status", "failed");
    }
  } catch (error) {
    console.error("payment/verify", error);
    confirmationUrl.searchParams.set("status", "failed");
  }

  return NextResponse.redirect(confirmationUrl);
}
