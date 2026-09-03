import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import { z } from "zod";
import { initiatePaymobPayment } from "@/lib/payments/paymob";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";
import { requireUser } from "@/lib/auth/get-current-user";
import { withPayloadTransaction } from "@/lib/core/db/transaction";
import { PaymentStatus } from "@/lib/core/types/types";
import { sql } from "@payloadcms/db-postgres/drizzle";

const paymobInitiateSchema = z.object({
  orderId: z.union([z.string(), z.number()]),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`paymob-initiate:${ip}`, RATE_LIMITS.checkout);
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = paymobInitiateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    const user = await requireUser(req);
    const payload = await getPayload({ config: configPromise });

    const orderId = Number(parsed.data.orderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
    }

    const claimResult = await withPayloadTransaction(
      payload as any,
      req as any,
      async (txReq, tx) => {
        const claim = await tx.execute(sql`
          SELECT id, amount, currency_code, email, name, phone
          FROM orders
          WHERE id = ${orderId}
            AND customer = ${Number(user.id)}
            AND payment_status = ${PaymentStatus.PENDING}
          FOR UPDATE
        `);

        const order = claim.rows?.[0];
        if (!order) return null;

        const merchantOrderId = `store-order-${order.id}-payment-${Date.now()}`;

        const paymentRes = await tx.execute(sql`
          INSERT INTO payments (
            order_id, provider, amount, currency, status,
            idempotency_key, attempt_number, expires_at, created_at
          )
          VALUES (
            ${order.id}, 'paymob', ${order.amount}, ${order.currency_code},
            ${PaymentStatus.INITIATING}, ${merchantOrderId}, 1,
            ${new Date(Date.now() + 10 * 60 * 1000).toISOString()}, NOW()
          )
          RETURNING id
        `);

        const paymentId = paymentRes.rows?.[0]?.id;

        const orderUpdate = await tx.execute(sql`
          UPDATE orders
          SET payment_status = ${PaymentStatus.INITIATING},
              merchant_order_id = ${merchantOrderId}
          WHERE id = ${order.id}
            AND payment_status = ${PaymentStatus.PENDING}
          RETURNING id
        `);

        if (!orderUpdate.rows?.[0]) {
          throw new Error("ORDER_CLAIM_FAILED");
        }

        return { order, paymentId, merchantOrderId };
      },
    );

    if (!claimResult) {
      return NextResponse.json(
        { message: "Payment already initiated or order not available" },
        { status: 409 },
      );
    }

    const amountCents = Math.round(claimResult.order.amount * 100);
    if (amountCents <= 0) {
      return NextResponse.json({ message: "Invalid order total" }, { status: 400 });
    }

    const result = await initiatePaymobPayment({
      merchantOrderId: claimResult.merchantOrderId,
      amountCents,
      currency: "egp",
      billingData: {
        first_name: claimResult.order.name?.split(" ")[0] || "Customer",
        last_name: claimResult.order.name?.split(" ").slice(1).join(" ") || "",
        email: claimResult.order.email,
        phone_number: claimResult.order.phone,
      },
      items: [],
    });

    // استخدم as any لأن paymobOrderId غير موجود في النوع بعد
    await payload.update({
      collection: "orders",
      id: String(claimResult.order.id),
      data: {
        paymobOrderId: String(result.paymobOrderId),
      } as any,
      overrideAccess: true,
    });

    return NextResponse.json({ iframeUrl: result.iframeUrl });
  } catch (error: any) {
    console.error("PAYMOB INITIATE ERROR:", error);

    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Payment initiation failed" },
      { status: 500 },
    );
  }
}