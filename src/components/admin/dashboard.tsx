"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiPlus,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

import CallmebotWidget from "@/components/admin/callmebot-widget";
import OrderRow from "@/components/admin/order-row";
import StatsCard from "@/components/admin/stats-card";
import ToastContainer, {
  type ToastMessage,
  type ToastType,
} from "@/components/admin/toast";
import "@/lib/styles/admin-dashboard.css";

export type AdminOrder = {
  id: number;
  name: string;
  phone: string;
  email: string;
  amount: number;
  status: string;
  createdAt: string;
  itemCount: number;
};

type Stats = {
  orders: {
    new: number;
    pendingPayment: number;
    ready: number;
    done: number;
    total: number;
  };
  revenue: {
    total: number;
    last30Days: number;
  };
  products: {
    published: number;
    sold: number;
    lowStock: number;
    inventoryCost: number;
    inventoryRetail: number;
    potentialProfit: number;
  };
  recentOrders: AdminOrder[];
};

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((type: ToastType, message: string) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), type, message },
    ]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadStats = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await fetch("/api/admin/stats", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = (await res.json()) as Stats;
        setStats(data);
      } catch (err) {
        console.error(err);
        notify("error", "فشل تحميل الإحصائيات");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleMarkedSold = useCallback(() => {
    // refresh stats after marking an order as sold
    setTimeout(() => loadStats(true), 500);
  }, [loadStats]);

  if (loading || !stats) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-header__title">
            <span className="admin-header__dot" />
            جارٍ التحميل...
          </div>
        </div>
        <div className="admin-stats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const { orders, revenue, products, recentOrders } = stats;

  return (
    <div className="admin-dashboard">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ═══════════ HEADER ═══════════ */}
      <div className="admin-header">
        <h1 className="admin-header__title">
          <span className="admin-header__dot" />
          لوحة التحكم
        </h1>

        <div className="admin-header__actions">
          <button
            type="button"
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="admin-btn admin-btn--ghost"
          >
            <FiRefreshCw
              size={14}
              style={{
                animation: refreshing ? "admin-spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "جارٍ التحديث..." : "تحديث"}
          </button>

          <Link
            href="/admin/collections/products/create"
            className="admin-btn admin-btn--primary"
          >
            <FiPlus size={16} />
            إضافة منتج
          </Link>
        </div>
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <div className="admin-stats-grid">
        <StatsCard
          label="طلبات جديدة"
          value={orders.new + orders.pendingPayment}
          hint="تحتاج متابعة"
          accent="#f59e0b"
          icon={<FiShoppingBag />}
        />
        <StatsCard
          label="قيد التنفيذ"
          value={orders.ready}
          hint="جاهزة للتسليم"
          accent="#3b82f6"
          icon={<FiPackage />}
        />
        <StatsCard
          label="مكتملة"
          value={orders.done}
          hint="تم البيع"
          accent="#10b981"
          icon={<FiPackage />}
        />
        <StatsCard
          label="إجمالي الطلبات"
          value={orders.total}
          accent="var(--admin-volt)"
          icon={<FiShoppingBag />}
        />
      </div>

      <div className="admin-stats-grid">
        <StatsCard
          label="إجمالي الإيرادات"
          value={fmt(revenue.total)}
          accent="#10b981"
          icon={<FiTrendingUp />}
        />
        <StatsCard
          label="إيرادات 30 يوم"
          value={fmt(revenue.last30Days)}
          accent="#10b981"
        />
        <StatsCard
          label="منتجات معروضة"
          value={products.published}
          accent="#3b82f6"
        />
        <StatsCard
          label="منتجات مبيعة"
          value={products.sold}
          accent="#6b7280"
        />
      </div>

      {/* ─── Low stock alert ─── */}
      {products.lowStock > 0 ? (
        <div
          className="admin-callmebot"
          style={{
            borderColor: "rgba(239, 68, 68, 0.35)",
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, transparent 60%)",
            marginBottom: 28,
          }}
        >
          <div className="admin-callmebot__info">
            <div
              className="admin-callmebot__icon"
              style={{
                background: "#ef4444",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.35)",
              }}
            >
              <FiAlertCircle />
            </div>
            <div className="admin-callmebot__text">
              <div className="admin-callmebot__title">تنبيه مخزون</div>
              <div className="admin-callmebot__status admin-callmebot__status--error">
                {products.lowStock} منتج بمخزون منخفض (أقل من 3)
              </div>
            </div>
          </div>

          <Link
            href="/admin/collections/products?where[inventory][less_than]=3"
            className="admin-btn admin-btn--ghost"
          >
            عرض المنتجات
          </Link>
        </div>
      ) : null}

      {/* ═══════════ RECENT ORDERS ═══════════ */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">آخر الطلبات</h2>
          <Link
            href="/admin/collections/orders"
            className="admin-section__link"
          >
            عرض الكل →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-empty">
            <FiShoppingBag className="admin-empty__icon" />
            <div className="admin-empty__text">لا توجد طلبات بعد</div>
          </div>
        ) : (
          <div className="admin-orders">
            {recentOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onMarkedSold={handleMarkedSold}
                onNotify={notify}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ CALLMEBOT ═══════════ */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">الإشعارات</h2>
        </div>
        <CallmebotWidget onNotify={notify} />
      </div>

      {/* ═══════════ INVENTORY VALUE ═══════════ */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">قيمة المخزون</h2>
        </div>

        <div className="admin-stats-grid">
          <StatsCard
            label="تكلفة المخزون"
            value={fmt(products.inventoryCost)}
            accent="#6b7280"
          />
          <StatsCard
            label="قيمة البيع المتوقعة"
            value={fmt(products.inventoryRetail)}
            accent="#3b82f6"
          />
          <StatsCard
            label="ربح محتمل"
            value={fmt(products.potentialProfit)}
            accent="#10b981"
          />
        </div>
      </div>
    </div>
  );
}