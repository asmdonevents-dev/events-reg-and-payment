const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitializeInput {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  currency?: string;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
      registrationId?: string;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: unknown;
      risk_action: string;
    };
  };
}

export async function initializePaystackTransaction(
  secretKey: string,
  input: PaystackInitializeInput
) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      currency: input.currency ?? "NGN",
    }),
    cache: "no-store",
  });

  const result = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !result.status) {
    throw new Error(result.message ?? "Failed to initialize payment");
  }

  return {
    authorizationUrl: result.data.authorization_url,
    reference: result.data.reference,
    accessCode: result.data.access_code,
  };
}

export async function verifyPaystackPayment(reference: string, secretKey?: string) {
  const resolvedSecretKey = secretKey ?? process.env.PAYSTACK_SECRET_KEY;

  if (!resolvedSecretKey) {
    return {
      success: false,
      message: "Payment configuration error. Secret key is missing.",
      data: null,
    };
  }

  const url = `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${resolvedSecretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 200) {
      const result = (await response.json()) as PaystackVerifyResponse;
      return {
        success: result.status,
        message: result.message,
        data: result.data,
      };
    }

    const errorData = (await response.json()) as { message?: string };
    return {
      success: false,
      message: errorData.message ?? "Payment verification failed",
      data: null,
    };
  } catch (error) {
    console.error("Error verifying Paystack payment:", error);
    return {
      success: false,
      message: "An error occurred while verifying the payment.",
      data: null,
    };
  }
}
