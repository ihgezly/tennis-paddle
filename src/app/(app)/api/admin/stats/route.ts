import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { OrderStatus, ProductStatus } from "@/lib/core/types/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user?.roles?.includes("admin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = await getPayload({ config: configPromise });

  // ✅ نجيب كل الإحصائيات في parallel
  const [
    newOrders,
    pendingPaymentOrders,
    readyOrders,
    doneOrders,
    totalOrders,
    publishedProducts,
    soldProducts,
    allProductsData,
    allOrdersData,
    recentOrders,
  ] = await Promise.all([
    payload.count({
      collection: "orders",
      where: { status: { equals: OrderStatus.NEW } },
    }),
    payload.count({
      collection: "orders",
      where: { status: { equals: OrderStatus.PENDING_PAYMENT } },
    }),
    payload.count({
      collection: "orders",
      where: { status: { equals: OrderStatus.READY } },
    }),
    payload.count({
      collection: "orders",
      where: { status: { equals: OrderStatus.DONE } },
    }),
    payload.count({ collection: "orders" }),
    payload.count({
      collection: "products",
      where: {
        and: [
          { _status: { equals: "published" } },
          { status: { equals: ProductStatus.AVAILABLE } },
        ],
      },
    }),
    payload.count({
      collection: "products",
      where: { status: { equals: ProductStatus.SOLD } },
    }),
    payload.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      limit: 0,
      pagination: false,
      depth: 0,
      select: {
        costPriceEGP: true,
        priceInEGP: true,
        inventory: true,
        status: true,
      } as any,
      overrideAccess: true,
    }),
    payload.find({
      collection: "orders",
      limit: 0,
      pagination: false,
      depth: 0,
      select: { amount: true, createdAt: true, status: true } as any,
      overrideAccess: true,
    }),
    payload.find({
      collection: "orders",
      sort: "-createdAt",
      limit: 8,
      depth: 0,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        amount: true,
        status: true,
        createdAt: true,
        items: true,
      } as any,
      overrideAccess: true,
    }),
  ]);

  // ─── الإيرادات ───
  const totalRevenue = (allOrdersData.docs as any[]).reduce(
    (s, o) => s + Number(o.amount ?? 0),
    0,
  );

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30Revenue = (allOrdersData.docs as any[])
    .filter((o) => new Date(o.createdAt).getTime() > thirtyDaysAgo)
    .reduce((s, o) => s + Number(o.amount ?? 0), 0);

  // ─── المخزون ───
  let totalCostValue = 0;
  let totalSaleValue = 0;
  let lowStockCount = 0;

  for (const p of allProductsData.docs as any[]) {
    if (p.status === ProductStatus.SOLD) continue;

    const stock = Number(p.inventory ?? 0);
    if (stock <= 0) continue;

    totalCostValue += Number(p.costPriceEGP ?? 0) * stock;
    totalSaleValue += Number(p.priceInEGP ?? 0) * stock;
    if (stock < 3) lowStockCount++;
  }

  // ─── آخر الطلبات (مع تفاصيل مصغّرة) ───
  const recent = (recentOrders.docs as any[]).map((o) => ({
    id: o.id,
    name: o.name,
    phone: o.phone,
    email: o.email,
    amount: Number(o.amount ?? 0),
    status: o.status,
    createdAt: o.createdAt,
    itemCount: Array.isArray(o.items) ? o.items.length : 0,
  }));

  return NextResponse.json({
    orders: {
      new: newOrders.totalDocs,
      pendingPayment: pendingPaymentOrders.totalDocs,
      ready: readyOrders.totalDocs,
      done: doneOrders.totalDocs,
      total: totalOrders.totalDocs,
    },
    revenue: {
      total: totalRevenue,
      last30Days: last30Revenue,
    },
    products: {
      published: publishedProducts.totalDocs,
      sold: soldProducts.totalDocs,
      lowStock: lowStockCount,
      inventoryCost: totalCostValue,
      inventoryRetail: totalSaleValue,
      potentialProfit: totalSaleValue - totalCostValue,
    },
    recentOrders: recent,
  });
}