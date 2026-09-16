import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { OrderStatus } from "@/lib/core/types/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user?.roles?.includes("admin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = await getPayload({ config: configPromise });

  const [pending, ready, done, allProducts, allOrders] = await Promise.all([
    payload.find({
      collection: "orders",
      where: { status: { equals: OrderStatus.PENDING_PAYMENT } },
      limit: 0,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: "orders",
      where: { status: { equals: OrderStatus.READY } },
      limit: 0,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: "orders",
      where: { status: { equals: OrderStatus.DONE } },
      limit: 0,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      limit: 0,
      pagination: false,
      depth: 0,
      select: { costPriceEGP: true, priceInEGP: true, inventory: true } as any,
    }),
    payload.find({
      collection: "orders",
      limit: 0,
      pagination: false,
      depth: 0,
      select: { amount: true, createdAt: true } as any,
    }),
  ]);

  // إيرادات إجمالية
  const totalRevenue = allOrders.docs.reduce(
    (s, o: any) => s + Number(o.amount ?? 0),
    0,
  );

  // إيرادات آخر 30 يوم
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30 = allOrders.docs
    .filter((o: any) => new Date(o.createdAt).getTime() > thirtyDaysAgo)
    .reduce((s, o: any) => s + Number(o.amount ?? 0), 0);

  // قيمة المخزون + تكلفة
  let totalCostValue = 0;
  let totalSaleValue = 0;
  let lowStockCount = 0;
  for (const p of allProducts.docs as any[]) {
    const stock = Number(p.inventory ?? 0);
    totalCostValue += Number(p.costPriceEGP ?? 0) * stock;
    totalSaleValue += Number(p.priceInEGP ?? 0) * stock;
    if (stock > 0 && stock < 3) lowStockCount++;
  }

  return NextResponse.json({
    orders: {
      pending: pending.totalDocs,
      ready: ready.totalDocs,
      done: done.totalDocs,
      total: allOrders.totalDocs,
    },
    revenue: {
      total: totalRevenue,
      last30Days: last30,
    },
    products: {
      published: allProducts.totalDocs,
      lowStock: lowStockCount,
      inventoryCost: totalCostValue,
      inventoryRetail: totalSaleValue,
      potentialProfit: totalSaleValue - totalCostValue,
    },
  });
}