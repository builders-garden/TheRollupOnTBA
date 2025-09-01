import {
  type PaymentBouncedEvent,
  type PaymentCompletedEvent,
  type PaymentStartedEvent,
} from "@daimo/pay-common";
import { NextRequest } from "next/server";
import { getAddress } from "viem";
import { z } from "zod";
import { env } from "@/lib/zod";

// Schema validation for webhook events
const paymentStartedEventSchema = z.custom<PaymentStartedEvent>();
const paymentCompletedEventSchema = z.custom<PaymentCompletedEvent>();
const paymentBouncedEventSchema = z.custom<PaymentBouncedEvent>();

type DaimoPayEvent =
  | PaymentStartedEvent
  | PaymentCompletedEvent
  | PaymentBouncedEvent;

// Handle health checks
export async function HEAD() {
  return new Response(null, { status: 200 });
}
export async function GET() {
  return Response.json({ status: "ok" }, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Get basic auth header
  const authHeader = request.headers.get("authorization");

  // For health checks or malformed requests, return early
  if (!authHeader) {
    console.log("No authorization header, possible health check");
    return Response.json({ success: true }, { status: 200 });
  }

  // Verify webhook signature
  if (
    !env.DAIMO_PAY_WEBHOOK_SECRET ||
    !authHeader.startsWith("Basic ") ||
    authHeader !== `Basic ${env.DAIMO_PAY_WEBHOOK_SECRET}`
  ) {
    console.log("Invalid authorization header format");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Safely parse JSON body with error handling
  let body;
  try {
    const text = await request.text();
    if (!text || text.trim() === "") {
      console.log("Received empty webhook body, ignoring request");
      return Response.json({ success: true }, { status: 200 });
    }
    body = JSON.parse(text);
  } catch (error) {
    console.error("Error parsing webhook JSON:", error);
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey) {
    return Response.json({ error: "Missing idempotency key" }, { status: 400 });
  }

  // Validate that body has required structure
  if (!body || typeof body !== "object" || !body.type) {
    console.log("Invalid webhook body structure:", body);
    return Response.json(
      { error: "Invalid webhook body structure" },
      { status: 400 },
    );
  }

  let data: DaimoPayEvent;
  switch (body.type) {
    case "payment_started":
      const paymentStartedEvent = paymentStartedEventSchema.safeParse(body);
      if (!paymentStartedEvent.success) {
        console.error(
          "Payment started validation error:",
          paymentStartedEvent.error,
        );
        return Response.json(
          { success: false, error: "Invalid payment_started event structure" },
          { status: 400 },
        );
      }
      data = paymentStartedEvent.data;
      break;
    case "payment_completed":
      const paymentCompletedEvent = paymentCompletedEventSchema.safeParse(body);
      if (!paymentCompletedEvent.success) {
        console.error(
          "Payment completed validation error:",
          paymentCompletedEvent.error,
        );
        return Response.json(
          {
            success: false,
            error: "Invalid payment_completed event structure",
          },
          { status: 400 },
        );
      }
      data = paymentCompletedEvent.data;
      break;
    case "payment_bounced":
      const paymentBouncedEvent = paymentBouncedEventSchema.safeParse(body);
      if (!paymentBouncedEvent.success) {
        console.error(
          "Payment bounced validation error:",
          paymentBouncedEvent.error,
        );
        return Response.json(
          { success: false, error: "Invalid payment_bounced event structure" },
          { status: 400 },
        );
      }
      data = paymentBouncedEvent.data;
      break;
    default:
      console.log("Unknown webhook event type:", body.type);
      return Response.json(
        { success: false, error: `Unknown event type: ${body.type}` },
        { status: 400 },
      );
  }

  // Get user info from metadata
  const userInfo = data.payment.metadata?.userInfo;
  if (!userInfo) {
    return Response.json(
      { success: false, error: "No user info found in metadata" },
      { status: 401 },
    );
  }

  // Early return to acknowledge webhook
  const response = Response.json({ success: true }, { status: 200 });

  // Process the webhook asynchronously
  processWebhookAsync(data, idempotencyKey);

  return response;
}

async function processWebhookAsync(
  data: DaimoPayEvent,
  idempotencyKey: string,
) {
  try {
    console.log("Processing DaimoPay webhook:", data.type, idempotencyKey);

    // Add basic validation
    if (!data || !data.type) {
      console.error("Invalid webhook data structure");
      return;
    }

    switch (data.type) {
      case "payment_started":
        await handlePaymentStarted(data);
        break;
      case "payment_completed":
        await handlePaymentCompleted(data);
        break;
      case "payment_bounced":
        await handlePaymentBounced(data);
        break;
      default:
        console.log("Unknown webhook type in async processing:", data.type);
    }
  } catch (error) {
    console.error("Error processing DaimoPay webhook:", error);
    // Don't throw here as this is async and shouldn't affect the response
  }
}

async function handlePaymentStarted(data: PaymentStartedEvent) {
  try {
    console.log("Payment started:", data.txHash);
    // Store payment started event if needed
    // Update any UI state or database records
  } catch (error) {
    console.error("Error handling payment started:", error);
  }
}

async function handlePaymentCompleted(data: PaymentCompletedEvent) {
  try {
    console.log("Payment completed:", data.txHash);

    const type = data.payment?.metadata?.type;

    if (type === "custom_type") {
      const sourceWalletAddress = getAddress(
        data.payment.source?.payerAddress ?? "",
      );

      console.log("Custom type payment completed:", {
        txHash: data.txHash,
        amount: data.payment?.destination?.amountUnits,
        callData: data.payment?.destination?.callData,
        sourceWalletAddress,
      });

      // TODO: Update local state if needed
      // This could include updating user history, notifications, etc.
    }
  } catch (error) {
    console.error("Error handling payment completed:", error);
  }
}

async function handlePaymentBounced(data: PaymentBouncedEvent) {
  try {
    console.log("Payment bounced:", data.txHash);
    // Handle failed payments
    // Maybe notify the user or update UI state
  } catch (error) {
    console.error("Error handling payment bounced:", error);
  }
}
