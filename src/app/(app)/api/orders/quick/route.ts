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
    // ═══ 1) حجز ذري ═══
    // ينجح بس لو المنتج published + available — من غير SELECT مسبق
    const reserved: any = await payload.db.drizzle.execute(sql`
      UPDATE products
      SET status = ${ProductStatus.PENDING}, updated_at = NOW()
      WHERE id = ${numericProductId}
        AND status = ${ProductStatus.AVAILABLE}
        AND _status = 'published'
      RETURNING id
    `);

    if (!reserved.rows?.[0]) {
      // مينفعش نعرف السبب من غير ما نسأل — بنسأل بـ Payload (آمن)
      const exists = await payload
        .findByID({
          collection: "products",
          id: numericProductId,
          depth: 0,
          overrideAccess: true,
        })
        .catch(() => null);

      return NextResponse.json(
        { message: exists ? "المنتج مش متاح حالياً" : "المنتج غير موجود" },
        { status: exists ? 409 : 404 },
      );
    }

    // دالة تراجع — بترجع المنتج Available لو أي خطوة فشلت
    const revert = () =>
      payload.db.drizzle.execute(sql`
        UPDATE products
        SET status = ${ProductStatus.AVAILABLE},
            updated_at = NOW()
        WHERE id = ${numericProductId}
      `);

    // ═══ 2) قراءة المنتج عن طريق Payload ═══
    // (يتعامل مع localized + أسماء الأعمدة تلقائيًا)
    const product: any = await payload
      .findByID({
        collection: "products",
        id: numericProductId,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null);

    if (!product) {
      await revert();
      return NextResponse.json(
        { message: "المنتج غير موجود" },
        { status: 404 },
      );
    }

    const price = Number(product.priceInEGP ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      await revert();
      return NextResponse.json(
        { message: "سعر المنتج غير صحيح" },
        { status: 400 },
      );
    }

    // ═══ 3) إنشاء الطلب ═══
    let order: any;
    try {
      order = await payload.create({
        collection: "orders",
        overrideAccess: true,
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
      });
    } catch (createErr) {
      // فشل إنشاء الطلب → رجّع المنتج Available
      await revert();
      throw createErr;
    }

    const orderId = Number(order.id);

    // ═══ 4) Audit Log ═══
    await logAudit({ payload } as any, {
      action: "quick_order.created",
      entity: "orders",
      entityId: String(orderId),
      after: {
        productId: numericProductId,
        amount: price,
        customerName: name,
        customerPhone: phone,
      },
    });

    // ═══ 5) إشعار الأدمن (لا نحجب الرد) ═══
    notifyAdminNewOrder({
      orderId,
      customerName: name,
      customerPhone: phone,
      amount: price,
      itemCount: 1,
    }).catch((err) => {
      console.error("Callmebot notification failed:", err);
    });

    return NextResponse.json({
      success: true,
      orderId,
      productTitle: product.title,
      amount: price,
    });
  } catch (err) {
    console.error("QUICK ORDER ERROR:", err);
    return NextResponse.json(
      { message: "فشل تسجيل الطلب، حاول تاني" },
      { status: 500 },
    );
  }
}