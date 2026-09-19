"use client";

import { useEffect, useState } from "react";

// ✅ استيراد الـCSS المخصص للأدمن
import "@/app/(payload)/custom-admin.css";

import appConfig from "@/lib/core/config";

type Stats = {
  orders: { pending: number; ready: number; done: number; total: number };
  revenue: { total: number; last30Days: number };
  products: {
    published: number;
    lowStock: number;
    inventoryCost: number;
    inventoryRetail: number;
    potentialProfit: number;
  };
};

const Card = ({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string | number;
  hint?: string;
  color?: string;
}) => (
  <div
    style={{
      border: "1px solid var(--theme-elevation-150)",
      borderRadius: 8,
      padding: "16px 20px",
      background: "var(--theme-elevation-50)",
      minWidth: 160,
      flex: 1,
    }}
  >
    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</div>
    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: color ?? "inherit",
        marginBottom: 4,
      }}
    >
      {value}
    </div>
    {hint ? (
      <div style={{ fontSize: 11, opacity: 0.6 }}>{hint}</div>
    ) : null}
  </div>
);

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${appConfig.SERVER_URL}/api/admin/stats`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
        نظرة عامة
      </h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card
          label="طلبات معلقة"
          value={stats.orders.pending}
          hint="بحاجة لتأكيد"
          color="#f59e0b"
        />
        <Card
          label="طلبات جاهزة"
          value={stats.orders.ready}
          hint="جاهزة للتسليم"
          color="#10b981"
        />
        <Card
          label="طلبات مكتملة"
          value={stats.orders.done}
          hint="آخر 30 يوم غير مبيّن"
          color="#3b82f6"
        />
        <Card label="إجمالي الطلبات" value={stats.orders.total} />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        <Card
          label="إجمالي الإيرادات"
          value={fmt(stats.revenue.total)}
          color="#10b981"
        />
        <Card
          label="إيرادات آخر 30 يوم"
          value={fmt(stats.revenue.last30Days)}
          color="#10b981"
        />
        <Card
          label="منتجات منشورة"
          value={stats.products.published}
        />
        <Card
          label="مخزون منخفض (< 3)"
          value={stats.products.lowStock}
          color={stats.products.lowStock > 0 ? "#ef4444" : "#10b981"}
        />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        <Card
          label="قيمة المخزون (تكلفة)"
          value={fmt(stats.products.inventoryCost)}
        />
        <Card
          label="قيمة المخزون (بيع)"
          value={fmt(stats.products.inventoryRetail)}
        />
        <Card
          label="ربح محتمل من المخزون"
          value={fmt(stats.products.potentialProfit)}
          color="#10b981"
        />
      </div>
    </div>
  );
}