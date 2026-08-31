import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import { paymobWebhookTransactionSchema } from "@/lib/core/validation";
import { verifyPaymobTransactionHmac } from "@/lib/payments/paymob";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";
import { CollectionName, IntegrationEventStatus } from "@/lib/core/types/types";
import { decrementInventoryForItems } from "@/lib/core/inventory";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`paymob-webhook:${ip}`, RATE_LIMITS.webhook);
  if (!rate.allowed) return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400 }); }

  const transaction = body?.obj ?? body;
  const receivedHmac = body?.hmac ?? body?.query?.hmac;

  if (!transaction || !verifyPaymobTransactionHmac(transaction, receivedHmac)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const parsed = paymobWebhookTransactionSchema.safeParse(transaction);
  if (!parsed.success) return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

  const { id: eventId, success, amount_cents, currency, order } = parsed.data;
  const payload = await getPayload({ config: configPromise });

  // Idempotency
  try {
    const existing = await payload.find({ collection: CollectionName.integrationEvents, where: { eventId: { equals: String(eventId) } }, limit: 1 });
    if (existing.docs?.length) return NextResponse.json({ message: "Already processed" });
  } catch {}

  const merchantOrderId = order?.merchant_order_id;
  let expectedAmountCents: number | null = null;
  if (merchantOrderId) {
    const match = merchantOrderId.match(/cart-(\d+)-/);
    if (match) {
      const cart = await payload.findByID({ collection: "carts", id: match[1], depth: 3 });
      if (cart) expectedAmountCents = cart.items.reduce((sum: number, item: any) => {
        const product = typeof item.product === "object" ? item.product : null;
        const variant = typeof item.variant === "object" ? item.variant : null;
        const unitPrice = variant?.priceInUSD ?? product?.priceInUSD ?? 0;
        return sum + Math.round(unitPrice * 100) * Number(item.quantity ?? 0);
      }, 0);
    }
  }

  if (expectedAmountCents !== null && amount_cents !== expectedAmountCents) {
    await payload.create({ collection: CollectionName.integrationEvents, data: { provider: "paymob", eventId: String(eventId), eventType: "transaction", resourceId: String(order?.id ?? ""), status: IntegrationEventStatus.FAILED, error: `Amount mismatch`, processedAt: new Date().toISOString() }, overrideAccess: true });
    return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
  }

  try {
    await payload.create({ collection: CollectionName.integrationEvents, data: { provider: "paymob", eventId: String(eventId), eventType: "transaction", resourceId: String(order?.id ?? ""), status: success ? IntegrationEventStatus.PROCESSED : IntegrationEventStatus.FAILED, processedAt: new Date().toISOString() }, overrideAccess: true });
  } catch (e: any) {
    return NextResponse.json({ message: "Already processed" });
  }

  if (success && merchantOrderId) {
    const match = merchantOrderId.match(/cart-(\d+)-/);
    if (match) {
      const cart = await payload.findByID({ collection: "carts", id: match[1], depth: 3 });
      if (cart) {
        const orderItems = cart.items.map((item: any) => {
          const product = typeof item.product === "object" ? item.product : null;
          const variant = typeof item.variant === "object" ? item.variant : null;
          const unitPrice = variant?.priceInUSD ?? product?.priceInUSD ?? 0;
          const quantity = Number(item.quantity ?? 0);
          return { product: product?.id, title: product?.title ?? "Product", quantity, unitPrice, lineTotal: unitPrice * quantity };
        });
        await payload.create({ collection: "orders", data: { cart: match[1], items: orderItems, amount: cart.subtotal, status: "new" }, overrideAccess: true });
        await decrementInventoryForItems({ payload } as any, cart.items);
      }
    }
  }

  return NextResponse.json({ message: "Webhook processed" });
}