import { NextResponse } from "next/server";
import { getPaymentSettingsForServer } from "@/data/payment-settings";
import { getRegistrationWithEvent } from "@/data/registrations";
import { initializePaystackTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { registrationId?: string };
    const registrationId = body.registrationId;

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const registration = await getRegistrationWithEvent(registrationId);

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.event.isFree) {
      return NextResponse.json({ error: "This is a free event" }, { status: 400 });
    }

    if (registration.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Registration already paid" }, { status: 400 });
    }

    const settings = await getPaymentSettingsForServer();
    if (!settings) {
      return NextResponse.json({ error: "Payment settings not configured" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const reference = `EVT-${registration.id}-${Date.now()}`;

    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { paymentRef: reference },
    });

    const payment = await initializePaystackTransaction(settings.paystackSecretKey, {
      email: registration.contactEmail ?? "no-reply@example.com",
      amount: Number(registration.amount),
      reference,
      callbackUrl: `${siteUrl}/api/payment/verify?registrationId=${registration.id}`,
      metadata: {
        registrationId: registration.id,
        eventTitle: registration.event.title,
      },
    });

    return NextResponse.json({ paymentUrl: payment.authorizationUrl });
  } catch (error) {
    console.error("payment/initiate", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
