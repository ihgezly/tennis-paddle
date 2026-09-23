"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiAlertCircle, FiX } from "react-icons/fi";

import type { Media } from "@/lib/core/types/payload-types";

import QuickOrderSuccess from "@/components/product/quick-order-success";
import {
  buildCustomerOrderWhatsAppLink,
  isValidEgyptianPhone,
} from "@/lib/core/quick-order";
import { cn } from "@/lib/core/util";
import "@/lib/styles/quick-order.css";

type Props = {
  open: boolean;
  onClose: () => void;
  product: {
    id: number;
    title: string;
    price: number;
    image?: Media | null;
  };
};

type SuccessData = {
  orderId: number;
  productTitle: string;
  amount: number;
};

export default function QuickOrderModal({ open, onClose, product }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  // Focus + reset on open
  useEffect(() => {
    if (open) {
      setError(null);
      setTimeout(() => nameRef.current?.focus(), 100);
    } else {
      setName("");
      setPhone("");
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setError("الاسم لازم يكون حرفين على الأقل");
      return;
    }

    if (!isValidEgyptianPhone(trimmedPhone)) {
      setError("رقم الموبايل غير صحيح");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: trimmedName,
          phone: trimmedPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "فشل تسجيل الطلب");
      }

      setSuccess({
        orderId: data.orderId,
        productTitle: data.productTitle,
        amount: data.amount,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const imageUrl =
    product.image?.url || product.image?.thumbnailURL || "";

  const formattedPrice = new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(product.price);

  // ─── Success state ───
  if (success) {
    const whatsappLink = buildCustomerOrderWhatsAppLink({
      customerPhone: phone,
      orderId: success.orderId,
      productTitle: success.productTitle,
      amount: success.amount,
    });

    return (
      <div
        className="quick-order-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="quick-order-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="quick-order__close"
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              position: "absolute",
              top: 16,
              insetInlineEnd: 16,
              zIndex: 5,
            }}
          >
            <FiX size={16} />
          </button>

          <QuickOrderSuccess
            orderId={success.orderId}
            productTitle={success.productTitle}
            amount={success.amount}
            whatsappLink={whatsappLink}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  // ─── Form state ───
  return (
    <div
      className="quick-order-overlay"
      onClick={() => !submitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-order-title"
    >
      <div
        className="quick-order-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="quick-order__header">
          <div>
            <h2 id="quick-order-title" className="quick-order__title">
              تأكيد الطلب
            </h2>
            <p className="quick-order__subtitle">
              أدخل بياناتك وسنتواصل معك على واتساب
            </p>
          </div>
          <button
            type="button"
            className="quick-order__close"
            onClick={onClose}
            disabled={submitting}
            aria-label="إغلاق"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Product summary */}
        <div className="quick-order__product">
          <div className="quick-order__product-image">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                sizes="64px"
                style={{ objectFit: "cover" }}
              />
            ) : null}
          </div>
          <div className="quick-order__product-info">
            <div className="quick-order__product-title">{product.title}</div>
            <div className="quick-order__product-price">{formattedPrice}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="quick-order__body">
            <div className="quick-order__field">
              <label htmlFor="qo-name" className="quick-order__label">
                الاسم الكامل
                <span className="quick-order__label-required">*</span>
              </label>
              <input
                ref={nameRef}
                id="qo-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد محمد"
                className="quick-order__input"
                disabled={submitting}
                autoComplete="name"
                maxLength={120}
                required
              />
            </div>

            <div className="quick-order__field">
              <label htmlFor="qo-phone" className="quick-order__label">
                رقم الموبايل
                <span className="quick-order__label-required">*</span>
              </label>
              <input
                id="qo-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className={cn("quick-order__input", "mono-num")}
                dir="ltr"
                disabled={submitting}
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>

            {error ? (
              <div className="quick-order__error">
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : null}
          </div>

          <div className="quick-order__footer">
            <button
              type="submit"
              className="quick-order__submit"
              disabled={submitting || !name.trim() || !phone.trim()}
            >
              {submitting ? "جارٍ التسجيل..." : "تأكيد الطلب"}
            </button>
            <p className="quick-order__note">
              بتأكيد الطلب، أنت موافق على إتمام الشراء والتواصل معك عبر
              واتساب.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}