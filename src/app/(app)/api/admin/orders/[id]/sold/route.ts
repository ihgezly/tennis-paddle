import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { logAudit } from "@/lib/core/audit";
import { OrderStatus, ProductStatus } from "@/lib/core/types/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/:id/sold
 * ───────────────────────────────
 * يحوّل الطلب إلى "done" + المنتجات إلى "sold"
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(req);
  if (!user?.roles?.includes("admin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });

  try {
    // 1) اجلب الطلب
    const order = await payload.findByID({
      collection: "orders",
      id: String(orderId),
      depth: 0,
      overrideAccess: true,
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.status === OrderStatus.DONE) {
      return NextResponse.json(
        { message: "Order already marked as sold" },
        { status: 400 },
      );
    }

    const before = {
      status: order.status,
      items: order.items,
    };

    // 2) حدّث الطلب
    const updatedOrder = await payload.update({
      collection: "orders",
      id: String(orderId),
      data: { status: OrderStatus.DONE },
      overrideAccess: true,
    });

    // 3) حدّث كل منتج في الطلب → sold + inventory 0
    const items = (order.items || []) as Array<{
      product: number | { id: number };
      quantity: number;
    }>;

    const updatedProducts: number[] = [];

    for (const item of items) {
      const productId =
        typeof item.product === "object" ? item.product.id : item.product;

      if (!productId) continue;

      try {
        await payload.update({
          collection: "products",
          id: String(productId),
          data: {
            status: ProductStatus.SOLD,
            inventory: 0,
          } as any, // ✅ بعد generate:types هيختفي التحذير
          overrideAccess: true,
        });
        updatedProducts.push(Number(productId));
      } catch (err) {
        console.error(`Failed to mark product ${productId} as sold:`, err);
      }
    }

    // 4) سجّل في Audit Log
    await logAudit({ payload, user } as any, {
      action: "order.marked_sold",
      entity: "orders",
      entityId: String(orderId),
      before,
      after: {
        status: OrderStatus.DONE,
        productsMarkedSold: updatedProducts,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      productsMarkedSold: updatedProducts,
    });
  } catch (err) {
    console.error("MARK SOLD ERROR:", err);
    return NextResponse.json(
      { message: "Failed to mark order as sold" },
      { status: 500 },
    );
  }
}