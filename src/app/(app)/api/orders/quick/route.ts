import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { sql } from "@payloadcms/db-postgres/drizzle";
import { z } from "zod";

import { logAudit } from "@/lib/core/audit";
import {
  checkRateLimit,
  getClientIp,
} from "@/lib/core/rate-limit";
import {
  OrderStatus,
  PaymentStatus,
  ProductStatus,
} from "@/lib/core/types/types";
import { notifyAdminNewOrder } from "@/lib/core/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const quickOrderSchema = z.object({
  productId: z.union([z.string(), z.number()]),
  name: z.string().trim().min(2, "الاسم مطلوب").max(120),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+?20)?0?1[0-9]{9}$|^\+?[0-9]{7,15}$/,
      "رقم الموبايل غير صحيح",
    ),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`quick-order:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { message: "محاولات كثيرة، حاول تاني بعد دقيقة" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = quickOrderSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { message: firstError?.message || "بيانات غير صحيحة" },
      { status: 400 },
    );
  }

  const { productId, name, phone } = parsed.data;
  const numericProductId = Number(productId);

  if (!Number.isSafeInteger(numericProductId) || numericProductId <= 0) {
    return NextResponse.json(
      { message: "معرف المنتج غير صحيح" },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.db.drizzle.transaction(async (tx: any) => {
      const productResult = await tx.execute(sql`
        SELECT id, title, price_in_e_g_p, status, inventory, _status
        FROM products
        WHERE id = ${numericProductId}
        FOR UPDATE
      `);

      const product = productResult.rows?.[0];

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (product._status !== "published") {
        throw new Error("PRODUCT_NOT_AVAILABLE");
      }

      if (product.status !== ProductStatus.AVAILABLE) {
        throw new Error("PRODUCT_NOT_AVAILABLE");
      }

      const price = Number(product.price_in_e_g_p ?? 0);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("INVALID_PRODUCT_PRICE");
      }

      const updateProduct = await tx.execute(sql`
        UPDATE products
        SET status = ${ProductStatus.PENDING},
            updated_at = NOW()
        WHERE id = ${numericProductId}
          AND status = ${ProductStatus.AVAILABLE}
        RETURNING id
      `);

      if (!updateProduct.rows?.[0]) {
        throw new Error("PRODUCT_RACE_CONDITION");
      }

      const order = await payload.create({
        collection: "orders",
        data: {
          status: OrderStatus.NEW,
          paymentStatus: PaymentStatus.PENDING,
          amount: price,
          currencyCode: "EGP",
          name,
          phone,
          email: `${phone.replace(/\D/g, "")}@quick-order.local`,
          items: [
            {
              product: numericProductId,
              title: product.title,
              quantity: 1,
              unitPrice: price,
              lineTotal: price,
            },
          ],
        } as any,
        overrideAccess: true,
        req: { transactionID: tx.transactionID } as any,
      });

      return {
        orderId: Number(order.id),
        productTitle: product.title,
        amount: price,
      };
    });

    await logAudit({ payload } as any, {
      action: "quick_order.created",
      entity: "orders",
      entityId: String(result.orderId),
      after: {
        productId: numericProductId,
        amount: result.amount,
        customerName: name,
        customerPhone: phone,
      },
    });

    notifyAdminNewOrder({
      orderId: result.orderId,
      customerName: name,
      customerPhone: phone,
      amount: result.amount,
      itemCount: 1,
    }).catch((err) => {
      console.error("Callmebot notification failed:", err);
    });

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      productTitle: result.productTitle,
      amount: result.amount,
    });
  } catch (err) {
    console.error("QUICK ORDER ERROR:", err);

    const message = err instanceof Error ? err.message : "UNKNOWN";

    if (message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { message: "المنتج غير موجود" },
        { status: 404 },
      );
    }

    if (message === "PRODUCT_NOT_AVAILABLE") {
      return NextResponse.json(
        { message: "المنتج مش متاح حالياً" },
        { status: 409 },
      );
    }

    if (message === "PRODUCT_RACE_CONDITION") {
      return NextResponse.json(
        { message: "المنتج اتحجز من عميل تاني، حاول تاني" },
        { status: 409 },
      );
    }

    if (message === "INVALID_PRODUCT_PRICE") {
      return NextResponse.json(
        { message: "سعر المنتج غير صحيح" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "فشل تسجيل الطلب، حاول تاني" },
      { status: 500 },
    );
  }
}