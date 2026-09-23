"use client";
import "../../lib/styles/admin-tailwind.css";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaSave,
  FaEdit,
} from "react-icons/fa";
import { toast } from "sonner";

import type { Order } from "@/payload-types";

import { withProviders } from "@/components/shared/elements-client";
import BaseApi from "@/lib/core/dal/base-api";
import { OrderStatus } from "@/lib/core/types/types";
import { cn, ORDER_STATUS_FLOW, postJson } from "@/lib/core/util";

type OrderItem = {
  id?: string | null;
  product: number | { id: number };
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderDetails = {
  id: string;
  phone: string;
  email: string;
  status: OrderStatus;
  items: OrderItem[];
  amount: number;
};

const base = {
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "9999px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
};

export const OrderContactActions = ({
  phone,
  email,
}: {
  phone: string;
  email: string;
}) => {
  if (!phone && !email) return null;

  return (
    <div style={{ display: "flex", gap: "1rem", padding: "0.5rem 0.25rem" }}>
      <a href={`tel:${phone}`} style={{ ...base, color: "#16a34a" }}>
        <FaPhoneAlt size="1.3rem" />
      </a>
      <a
        href={`https://wa.me/${phone.replace(/^0/, "20")}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...base, color: "#25D366" }}
      >
        <FaWhatsapp size="1.3rem" />
      </a>
      <a href={`mailto:${email}`} style={{ ...base, color: "#2563eb" }}>
        <FaEnvelope size="1.3rem" />
      </a>
    </div>
  );
};

const Divider = () => (
  <div style={{ height: 1, backgroundColor: "#e5e7eb", margin: "8px 0" }} />
);

const useOrderId = () => {
  const params = useParams();
  return useMemo(() => {
    const id =
      (params as any)?.segments?.at(-1) ??
      (typeof window === "undefined"
        ? undefined
        : window.location.pathname.split("/").at(-1));
    return id && id !== "create" ? id : undefined;
  }, [params]);
};

const OrderViewInner = () => {
  const id = useOrderId();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let isCurrent = true;

    BaseApi.fetchApi<
      Pick<Order, "phone" | "email" | "status" | "items" | "amount">
    >(`orders/${id}`, {
      expect: "json",
      select: {
        phone: true,
        email: true,
        status: true,
        items: true,
        amount: true,
      } as any,
    }).then((data) => {
      if (!isCurrent) return;
      setOrder({
        id,
        phone: data.phone,
        email: data.email,
        status: (data.status ?? OrderStatus.PENDING_PAYMENT) as OrderStatus,
        items: (data.items ?? []) as OrderItem[],
        amount: data.amount ?? 0,
      });
    });

    return () => {
      isCurrent = false;
    };
  }, [id, refreshKey]);

  // ✅ null check صريح عشان TypeScript
  if (!id || !order || order.id !== id) return null;

  return (
    <div>
      <OrderContactActions phone={order.phone} email={order.email} />
      <Divider />
      <OrderStatusPanelInner key={id} initialStatus={order.status} id={id} />
      <Divider />
      <PriceEditor
        orderId={id}
        items={order.items}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};

const OrderStatusChip = ({ status }: { status: OrderStatus }) => {
  const t = useTranslations("admin.orderStatus");
  return (
    <span className="order-status-chip" data-status={status}>
      <span className="order-status-chip__dot" aria-hidden="true" />
      {t(`values.${status}`)}
    </span>
  );
};

const OrderStatusPanelInner = ({
  initialStatus,
  id,
}: {
  initialStatus: OrderStatus;
  id: string;
}) => {
  const t = useTranslations("admin.orderStatus");
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const nextOptions = ORDER_STATUS_FLOW[status];

  const handleClick = async (nextStatus: OrderStatus) => {
    setPending(nextStatus);
    try {
      await postJson(`orders/${id}/status`, { status: nextStatus });
      setStatus(nextStatus);
      toast.success(t("updateSuccess"));
    } catch {
      toast.error(t("updateError"));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="order-status-vars flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3
          className="font-semibold text-gray-500"
          style={{ marginInlineEnd: 6 }}
        >
          {t("title")}
        </h3>
        <OrderStatusChip status={status} />
      </div>
      {nextOptions.length > 0 && (
        <div>
          <h3 className="mb-2">{t("statusUpdate")}</h3>
          <div className="flex flex-wrap gap-2">
            {nextOptions.map((nextStatus) => (
              <button
                type="button"
                key={nextStatus}
                disabled={pending !== null}
                onClick={() => handleClick(nextStatus)}
                className={cn(
                  "border-none bg-transparent p-0 transition-opacity",
                  pending ? "cursor-default" : "cursor-pointer",
                  pending && pending !== nextStatus
                    ? "opacity-50"
                    : "opacity-100",
                )}
              >
                <OrderStatusChip status={nextStatus} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PriceEditor = ({
  orderId,
  items,
  onSaved,
}: {
  orderId: string;
  items: OrderItem[];
  onSaved: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      const key = item.id ?? String(item.product);
      map[key] = item.unitPrice;
    }
    setDraft(map);
  }, [items]);

  const save = async () => {
    setSaving(true);
    try {
      const payloadItems = items.map((item) => {
        const key = item.id ?? String(item.product);
        return {
          id: item.id,
          product:
            typeof item.product === "object" ? item.product.id : item.product,
          unitPrice: draft[key] ?? item.unitPrice,
        };
      });

      await postJson(`orders/${orderId}/adjust-price`, { items: payloadItems });
      toast.success("تم تعديل الأسعار");
      setEditing(false);
      onSaved();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "فشل تعديل الأسعار";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "0.5rem 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3 className="font-semibold text-gray-500">تعديل أسعار الطلب</h3>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              display: "inline-flex",
              gap: 6,
              alignItems: "center",
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <FaEdit /> تعديل
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "transparent",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                display: "inline-flex",
                gap: 6,
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: "#10b981",
                color: "white",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <FaSave /> {saving ? "..." : "حفظ"}
            </button>
          </div>
        )}
      </div>

      <table style={{ width: "100%", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "start", color: "#6b7280" }}>
            <th style={{ textAlign: "start", padding: 4 }}>المنتج</th>
            <th style={{ textAlign: "start", padding: 4 }}>الكمية</th>
            <th style={{ textAlign: "start", padding: 4 }}>سعر الوحدة (EGP)</th>
            <th style={{ textAlign: "start", padding: 4 }}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const key = item.id ?? String(item.product);
            const price = draft[key] ?? item.unitPrice;
            const lineTotal = price * item.quantity;
            return (
              <tr key={key} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: 6 }}>{item.title}</td>
                <td style={{ padding: 6 }}>{item.quantity}</td>
                <td style={{ padding: 6 }}>
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={price}
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: Number(e.target.value) })
                      }
                      style={{
                        width: 100,
                        padding: 4,
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    price
                  )}
                </td>
                <td style={{ padding: 6 }}>{lineTotal}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid #e5e7eb", fontWeight: 600 }}>
            <td colSpan={3} style={{ padding: 6 }}>
              الإجمالي الجديد
            </td>
            <td style={{ padding: 6 }}>
              {items.reduce(
                (s, item) =>
                  s +
                  (draft[item.id ?? String(item.product)] ?? item.unitPrice) *
                    item.quantity,
                0,
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export const OrderView = withProviders(OrderViewInner);