import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import { paymobWebhookTransactionSchema } from "@/lib/core/validation";
import { verifyPaymobTransactionHmac } from "@/lib/payments/paymob";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";
import { PaymentStatus, OrderStatus } from "@/lib/core/types/types";
import { convertReservationToSale, releaseInventory } from "@/lib/core/inventory";
import { withPayloadTransaction } from "@/lib/core/db/transaction";
import { sql } from "@payloadcms/db-postgres/drizzle";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`paymob-webhook:${ip}`, RATE_LIMITS.webhook);
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const transaction = body?.obj ?? body;
  const receivedHmac = body?.hmac ?? body?.query?.hmac;

  if (!transaction || !verifyPaymobTransactionHmac(transaction, receivedHmac)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const parsed = paymobWebhookTransactionSchema.safeParse(transaction);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const { id: eventId, success, amount_cents, currency } = parsed.data;
  const merchantOrderId = parsed.data.order?.merchant_order_id;

  if (!merchantOrderId) {
    return NextResponse.json({ message: "Missing merchant order ID" }, { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });

  const ordersRes = await payload.find({
    collection: "orders",
    where: { merchant_order_id: { equals: merchantOrderId } },
    limit: 1,
  });

  const orderDoc = ordersRes.docs?.[0];
  if (!orderDoc) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const orderId = Number(orderDoc.id);

  const expectedAmountCents = Math.round((orderDoc.amount || 0) * 100);
  if (amount_cents !== expectedAmountCents) {
    return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
  }

  if (currency.toLowerCase() !== ((orderDoc as any).currencyCode || "egp").toLowerCase()) {
    return NextResponse.json({ message: "Currency mismatch" }, { status: 400 });
  }

  try {
    await withPayloadTransaction(
      payload as any,
      req as any,
      async (txReq, tx) => {
        const orderResult = await tx.execute(sql`
          SELECT id, payment_status, status
          FROM orders
          WHERE id = ${orderId}
          FOR UPDATE
        `);
        const order = orderResult.rows?.[0];

        if (!order) throw new Error("ORDER_NOT_FOUND");

        if (order.payment_status === PaymentStatus.PAID) {
          return { outcome: "already_paid" };
        }

        if (success) {
          if (order.payment_status !== PaymentStatus.INITIATING) {
            return { outcome: "ignored_invalid_state" };
          }

          const paymentResult = await tx.execute(sql`
            SELECT id, status
            FROM payments
            WHERE order_id = ${orderId} AND provider = 'paymob'
            ORDER BY id DESC LIMIT 1
            FOR UPDATE
          `);
          const payment = paymentResult.rows?.[0];

          if (!payment) throw new Error("PAYMENT_NOT_FOUND");
          if (payment.status === PaymentStatus.PAID) {
            throw new Error("ORDER_PAYMENT_STATE_MISMATCH");
          }
          if (payment.status !== PaymentStatus.INITIATING) {
            throw new Error("INVALID_PAYMENT_STATE");
          }

          const orderUpdate = await tx.execute(sql`
            UPDATE orders
            SET payment_status = ${PaymentStatus.PAID},
                status = ${OrderStatus.READY},
                paymob_transaction_id = ${String(eventId)}
            WHERE id = ${orderId}
              AND payment_status = ${PaymentStatus.INITIATING}
            RETURNING id
          `);
          if (!orderUpdate.rows?.[0]) {
            throw new Error("ORDER_STATE_UPDATE_FAILED");
          }

          const paymentUpdate = await tx.execute(sql`
            UPDATE payments
            SET status = ${PaymentStatus.PAID},
                provider_transaction_id = ${String(eventId)},
                paid_at = NOW()
            WHERE id = ${payment.id}
              AND status = ${PaymentStatus.INITIATING}
            RETURNING id
          `);
          if (!paymentUpdate.rows?.[0]) {
            throw new Error("PAYMENT_STATE_UPDATE_FAILED");
          }

          await convertReservationToSale(tx, orderId);
        } else {
          if (
            [PaymentStatus.FAILED, PaymentStatus.EXPIRED, PaymentStatus.CANCELLED].includes(
              order.payment_status as PaymentStatus,
            )
          ) {
            return { outcome: "already_terminal" };
          }
          if (order.payment_status !== PaymentStatus.INITIATING) {
            throw new Error("INVALID_FAILURE_TRANSITION");
          }

          const paymentUpdate = await tx.execute(sql`
            UPDATE payments
            SET status = ${PaymentStatus.FAILED},
                failed_at = NOW(),
                provider_transaction_id = COALESCE(provider_transaction_id, ${String(eventId)})
            WHERE order_id = ${orderId}
              AND status = ${PaymentStatus.INITIATING}
            RETURNING id
          `);
          if (!paymentUpdate.rows?.[0]) {
            throw new Error("PAYMENT_FAILURE_UPDATE_FAILED");
          }

          const orderUpdate = await tx.execute(sql`
            UPDATE orders
            SET payment_status = ${PaymentStatus.FAILED},
                status = ${OrderStatus.CANCELED}
            WHERE id = ${orderId}
              AND payment_status = ${PaymentStatus.INITIATING}
            RETURNING id
          `);
          if (!orderUpdate.rows?.[0]) {
            throw new Error("ORDER_FAILURE_UPDATE_FAILED");
          }

          await releaseInventory(tx, orderId, "payment_failed");
        }

        const insertEvent = await tx.execute(sql`
          INSERT INTO integration_events (
            provider, event_id, event_type, resource_id, status, processed_at
          )
          VALUES (
            'paymob', ${String(eventId)}, 'transaction', ${String(orderId)}, 'processed', NOW()
          )
          ON CONFLICT (provider, event_id) DO NOTHING
        `);

        if ((insertEvent.rowCount ?? 0) === 0) {
          throw new Error("DUPLICATE_EVENT");
        }

        return { outcome: "processed" };
      },
    );

    return NextResponse.json({ message: "Webhook processed" });
  } catch (e: any) {
    console.error("WEBHOOK PROCESSING ERROR:", e);

    if (e?.message === "DUPLICATE_EVENT") {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }
    if (e?.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (
      e?.message === "INVALID_PAYMENT_STATE" ||
      e?.message === "ORDER_PAYMENT_STATE_MISMATCH" ||
      e?.message === "INVALID_FAILURE_TRANSITION"
    ) {
      return NextResponse.json({ message: "Invalid payment state" }, { status: 409 });
    }

    return NextResponse.json({ message: "Processing failed" }, { status: 500 });
  }
}