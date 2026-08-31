import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import { paymobInitiateSchema, formatZodError } from "@/lib/core/validation";
import { initiatePaymobPayment } from "@/lib/payments/paymob";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`paymob-initiate:${ip}`, RATE_LIMITS.checkout);
  if (!rate.allowed) return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400 }); }

  const parsed = paymobInitiateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });

  const { cartId, name, phone, email } = parsed.data;

  try {
    const payload = await getPayload({ config: configPromise });
    const cart = await payload.findByID({ collection: "carts", id: String(cartId), depth: 3 });
    if (!cart || !cart.items?.length) return NextResponse.json({ message: "Cart is empty" }, { status: 400 });

    const items = cart.items.map((item: any) => {
      const product = typeof item.product === "object" ? item.product : null;
      const variant = typeof item.variant === "object" ? item.variant : null;
      const unitPrice = variant?.priceInUSD ?? product?.priceInUSD ?? 0;
      const quantity = Number(item.quantity ?? 0);
      return { name: product?.title ?? "Product", amount_cents: Math.round(unitPrice * 100), quantity };
    });

    const totalAmountCents = items.reduce((sum, item) => sum + item.amount_cents * item.quantity, 0);
    if (totalAmountCents <= 0) return NextResponse.json({ message: "Invalid cart total" }, { status: 400 });

    const [firstName, ...lastParts] = name.split(" ");
    const lastName = lastParts.join(" ") || "";

    const result = await initiatePaymobPayment({
      merchantOrderId: `cart-${cartId}-${Date.now()}`,
      amountCents: totalAmountCents,
      currency: "EGP",
      billingData: { first_name: firstName, last_name: lastName, email, phone_number: phone },
      items,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("PAYMOB INITIATE ERROR:", error);
    return NextResponse.json({ message: error?.message || "Payment initiation failed" }, { status: 500 });
  }
}