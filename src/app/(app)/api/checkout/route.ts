import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";
import { requireUser } from "@/lib/auth/get-current-user";
import { withPayloadTransaction } from "@/lib/core/db/transaction";
import { reserveInventory } from "@/lib/core/inventory";
import { OrderStatus, PaymentStatus } from "@/lib/core/types/types";

const checkoutSchema = z.object({
  cartId: z.union([z.string(), z.number()]),
});

type CheckoutItem = {
  product: number;
  variant: number | null;
  sku: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`checkout:${ip}`, RATE_LIMITS.checkout);
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  try {
    const user = await requireUser(req);
    const payload = await getPayload({ config: configPromise });

    const cart = await payload.findByID({
      collection: "carts",
      id: String(parsed.data.cartId),
      depth: 3,
    });

    const cartItems = cart?.items || [];
    if (!cart || cartItems.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // ملكية السلة
    const cartCustomerId =
      typeof cart.customer === "object"
        ? Number((cart.customer as any)?.id)
        : Number(cart.customer);

    if (!cartCustomerId || cartCustomerId !== Number(user.id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const result = await withPayloadTransaction(
      payload as any,
      req as any,
      async (txReq, tx) => {
        const items: CheckoutItem[] = [];

        for (const cartItem of cartItems) {
          const productId =
            typeof cartItem.product === "object"
              ? Number((cartItem.product as any)?.id)
              : Number(cartItem.product);

          const variantId =
            typeof cartItem.variant === "object"
              ? Number((cartItem.variant as any)?.id)
              : Number(cartItem.variant || 0);

          if (!Number.isSafeInteger(productId) || productId <= 0) {
            throw new Error("INVALID_PRODUCT_ID");
          }

          const quantity = Number(cartItem.quantity);
          if (!Number.isSafeInteger(quantity) || quantity <= 0) {
            throw new Error("INVALID_QUANTITY");
          }

          const product = await payload.findByID({
            collection: "products",
            id: String(productId),
            depth: 0,
            overrideAccess: true,
            req: txReq,
          });

          if (!product) throw new Error("PRODUCT_NOT_FOUND");
          if (product._status !== "published") throw new Error("PRODUCT_NOT_AVAILABLE");

          let variant: any = null;
          if (variantId) {
            variant = await payload.findByID({
              collection: "variants",
              id: String(variantId),
              depth: 0,
              overrideAccess: true,
              req: txReq,
            });

            if (!variant) throw new Error("VARIANT_NOT_FOUND");

            const variantProductId =
              typeof variant.product === "object"
                ? Number(variant.product?.id)
                : Number(variant.product);

            if (variantProductId !== productId) {
              throw new Error("VARIANT_PRODUCT_MISMATCH");
            }
          }

          // استخدم priceInUSD مؤقتًا حتى نضيف priceInEGP
          const unitPrice = Number(
            (variant as any)?.priceInUSD ??
            (product as any)?.priceInUSD ??
            0,
          );

          if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            throw new Error("INVALID_PRODUCT_PRICE");
          }

          const lineTotal = unitPrice * quantity;
          if (!Number.isFinite(lineTotal) || lineTotal <= 0) {
            throw new Error("INVALID_LINE_TOTAL");
          }

          items.push({
            product: productId,
            variant: variantId || null,
            sku: (variant as any)?.sku ?? null,
            title: variant?.title || product.title || "Product",
            quantity,
            unitPrice,
            lineTotal,
          });
        }

        if (!items.length) throw new Error("EMPTY_CHECKOUT");

        const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
          throw new Error("INVALID_TOTAL");
        }

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const order = await payload.create({
          collection: "orders",
          data: {
            customer: Number(user.id),
            items,
            amount: totalAmount,
            status: OrderStatus.PENDING_PAYMENT,
            paymentStatus: PaymentStatus.PENDING, // سيكون as any لأنه غير موجود في النوع بعد
            currencyCode: "EGP",
            name: (cart.customer as any)?.name || user.email,
            phone: (cart.customer as any)?.phone || "",
            email: (cart.customer as any)?.email || user.email,
          } as any, // استخدام as any لتجاوز الحقول غير المعروفة
          overrideAccess: true,
          req: txReq,
        });

        await reserveInventory(tx, items, Number(order.id), expiresAt);

        return { orderId: Number(order.id), totalAmount, currencyCode: "EGP" };
      },
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);

    if (error?.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error?.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    if (error?.message === "INVALID_QUANTITY" || error?.message === "INVALID_PRODUCT_ID") {
      return NextResponse.json({ message: "Invalid cart item" }, { status: 400 });
    }
    if (
      error?.message === "PRODUCT_NOT_FOUND" ||
      error?.message === "VARIANT_NOT_FOUND" ||
      error?.message === "PRODUCT_NOT_AVAILABLE" ||
      error?.message === "VARIANT_PRODUCT_MISMATCH"
    ) {
      return NextResponse.json({ message: "One or more products are no longer available" }, { status: 400 });
    }
    if (error?.message === "INVALID_PRODUCT_PRICE" || error?.message === "INVALID_LINE_TOTAL" || error?.message === "INVALID_TOTAL") {
      return NextResponse.json({ message: "Unable to calculate order total" }, { status: 400 });
    }
    if (error?.name === "InsufficientStockError") {
      return NextResponse.json({ message: "Some items are out of stock" }, { status: 409 });
    }

    return NextResponse.json({ message: "Checkout failed" }, { status: 500 });
  }
}