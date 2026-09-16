"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

import CheckoutForm from "@/components/checkout/checkout-form";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import appConfig from "@/lib/core/config";

const SuccessCheck = () => (
  <div
    className="flex h-20 w-20 items-center justify-center rounded-full"
    style={{
      backgroundColor: "rgba(215, 181, 109, 0.12)",
      boxShadow: "0 0 40px rgba(215, 181, 109, 0.4)",
    }}
  >
    <svg viewBox="0 0 52 52" className="h-10 w-10">
      <circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeDasharray="151"
        strokeDashoffset="151"
        style={{ animation: "circle-draw 0.6s ease-out forwards" }}
      />
      <path
        d="M15 27l7 7 15-15"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="40"
        strokeDashoffset="40"
        style={{
          animation: "check-draw 0.4s 0.5s ease-out forwards",
          opacity: 0,
        }}
      />
    </svg>
  </div>
);

export default function CheckoutClient() {
  const t = useTranslations("checkout.page");
  const { cart, clearCart } = useCart();
  const [orderId, setOrderId] = useState<string | null>(null);

  const cartIsEmpty = !cart?.items?.length;

  const cartId = useMemo(() => {
    const id = cart?.id;
    return typeof id === "number" ? id : undefined;
  }, [cart]);

  // ═══ ORDER SUCCESS SCREEN ═══
  if (orderId) {
    const waNumber = appConfig.WHATSAPP_NUMBER;
    const message = encodeURIComponent(
      `${appConfig.WHATSAPP_MESSAGE} #${orderId}`,
    );
    const waLink = waNumber
      ? `https://wa.me/${waNumber}?text=${message}`
      : null;

    return (
      <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
        <SuccessCheck />

        <h2 className="text-3xl font-bold md:text-4xl">
          {t("orderReceived")}
        </h2>

        <p className="text-xl font-semibold text-gold">
          {t("orderId", { id: orderId })}
        </p>

        <p className="max-w-md text-text-secondary">
          سنتواصل معك خلال 24 ساعة لتأكيد الطلب وتحديد طريقة الدفع
          والاستلام.
        </p>

        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 font-semibold text-white transition hover:opacity-90"
            style={{ boxShadow: "0 0 24px rgba(37, 211, 102, 0.35)" }}
          >
            <FaWhatsapp size={22} />
            تأكيد عبر واتساب
          </a>
        ) : null}

        {appConfig.CONTACT_PHONE ? (
          <a
            href={`tel:${appConfig.CONTACT_PHONE}`}
            className="text-sm text-text-secondary underline underline-offset-4 hover:text-gold"
          >
            أو اتصل بنا: {appConfig.CONTACT_PHONE}
          </a>
        ) : null}

        <Link
          href="/"
          className="mt-6 text-sm underline underline-offset-4 hover:text-gold"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  // ═══ EMPTY CART ═══
  if (cartIsEmpty) {
    return (
      <div className="flex flex-col items-center py-12 text-center text-foreground">
        <p className="text-lg font-medium">{t("emptyCart")}</p>
        <Link
          href="/"
          className="mt-4 text-gold underline underline-offset-4 hover:opacity-80"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  // ═══ CHECKOUT FORM + SUMMARY ═══
  return (
    <div className="mx-auto my-8 flex w-full max-w-5xl flex-col items-start justify-center gap-6 px-4 md:flex-row">
      <CheckoutForm
        cartId={cartId}
        clearCart={clearCart}
        onSuccess={(id) => {
          void clearCart?.();
          setOrderId(id);
        }}
      />
      <CheckoutSummary />
    </div>
  );
}