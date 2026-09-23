"use client";

import { useState } from "react";
import Link from "next/link";
import { FaCheck, FaWhatsapp } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

import { OrderStatus } from "@/lib/core/types/types";
import { buildCustomerWhatsAppLink, buildOrderMessage } from "@/lib/core/whatsapp";
import { cn } from "@/lib/core/util";

import type { AdminOrder } from "@/components/admin/dashboard";

type Props = {
  order: AdminOrder;
  onMarkedSold: () => void;
  onNotify: (type: "success" | "error", message: string) => void;
};

const STATUS_LABELS: Record<string, string> = {
  [OrderStatus.NEW]: "جديد",
  [OrderStatus.PENDING_PAYMENT]: "قيد الدفع",
  [OrderStatus.READY]: "جاهز",
  [OrderStatus.DONE]: "مكتمل",
  [OrderStatus.CANCELED]: "ملغي",
  [OrderStatus.REFUNDED]: "مسترجع",
};

export default function OrderRow({ order, onMarkedSold, onNotify }: Props) {
  const [marking, setMarking] = useState(false);

  const isDone = order.status === OrderStatus.DONE;
  const isCanceled = order.status === OrderStatus.CANCELED;

  const whatsappLink = buildCustomerWhatsAppLink(
    order.phone,
    buildOrderMessage({
      orderId: order.id,
      customerName: order.name,
      customerPhone: order.phone,
      amount: order.amount,
      itemCount: order.itemCount,
    }),
  );

  const handleMarkSold = async () => {
    if (isDone) return;

    setMarking(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/sold`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "فشل تحديث الطلب");
      }

      onNotify("success", `تم تأكيد الطلب #${order.id} بنجاح ✅`);
      onMarkedSold();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      onNotify("error", msg);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="admin-order">
      <div className="admin-order__id">#{order.id}</div>

      <div className="admin-order__info">
        <div className="admin-order__name">{order.name}</div>
        <div className="admin-order__meta">
          <span dir="ltr">{order.phone}</span>
          <span>•</span>
          <span>{order.itemCount} منتج</span>
          <span>•</span>
          <span
            className={cn("admin-badge", `admin-badge--${order.status}`)}
          >
            <span className="admin-badge__dot" />
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      <div className="admin-order__amount">
        {new Intl.NumberFormat("ar-EG", {
          style: "currency",
          currency: "EGP",
          maximumFractionDigits: 0,
        }).format(order.amount)}
      </div>

      <div className="admin-order__actions">
        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--sm admin-btn--whatsapp"
            title="تواصل عبر واتساب"
          >
            <FaWhatsapp size={14} />
          </a>
        ) : null}

        <Link
          href={`/admin/collections/orders/${order.id}`}
          className="admin-btn admin-btn--sm admin-btn--ghost"
          title="فتح الطلب"
        >
          <FiExternalLink size={14} />
        </Link>

        {!isDone && !isCanceled ? (
          <button
            type="button"
            onClick={handleMarkSold}
            disabled={marking}
            className="admin-btn admin-btn--sm admin-btn--success"
            title="تم البيع"
          >
            <FaCheck size={12} />
            {marking ? "..." : "تم البيع"}
          </button>
        ) : isDone ? (
          <span className="admin-badge admin-badge--done">
            <span className="admin-badge__dot" />
            تم
          </span>
        ) : null}
      </div>
    </div>
  );
}