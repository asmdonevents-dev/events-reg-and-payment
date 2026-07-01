import { formatResponseValue } from "@/lib/form-fields";
import type { FormFieldUI } from "@/validators/types/form-field";
import { Resend } from "resend";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("Resend not configured — skipping email to", to);
    return { success: true, skipped: true };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend send failed:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

export function buildRegistrationConfirmationEmail(params: {
  fullName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  registrationId: string;
  amount: string;
  isPaid: boolean;
  responses?: Record<string, string | string[] | boolean>;
  formFields?: FormFieldUI[];
  assignedGroup?: string | null;
}) {
  const paymentLine = params.isPaid
    ? `<p><strong>Amount paid:</strong> ${params.amount}</p>`
    : `<p><strong>Ticket:</strong> Free registration</p>`;

  const assignmentLine = params.assignedGroup
    ? `<p><strong>Assigned group:</strong> ${params.assignedGroup}</p>`
    : "";

  const responseLines =
    params.formFields && params.responses
      ? params.formFields
          .map(
            (field) =>
              `<p><strong>${field.label}:</strong> ${formatResponseValue(params.responses?.[field.fieldKey])}</p>`
          )
          .join("")
      : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Registration Confirmed</h2>
      <p>Hello ${params.fullName},</p>
      <p>Your registration for <strong>${params.eventTitle}</strong> has been confirmed.</p>
      <p><strong>Date:</strong> ${params.eventDate}</p>
      <p><strong>Venue:</strong> ${params.venue}</p>
      ${paymentLine}
      ${assignmentLine}
      ${responseLines}
      <p><strong>Reference:</strong> ${params.registrationId}</p>
      <p>Please keep this reference for your records.</p>
    </div>
  `;
}
