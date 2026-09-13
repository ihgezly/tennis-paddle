"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

import CheckoutForm from "@/components/checkout/checkout-form";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import appConfig from "@/lib/core/config";

export default function CheckoutClient() {
  const t = useTranslations("checkout.page");
  const { cart, clearCart } = useCart();
  const [orderId, setOrderId] = useState<string | null>(null);

  const cartIsEmpty = !cart?.items?.length;

  const cartId = useMemo(() => {
    const id = cart?.id;
    return typeof id === "number" ? id : undefined;
  }, [cart]);

  if (orderId) {
    const waNumber = appConfig.WHATSAPP_NUMBER;
    const message = encodeURIComponent(
      `${appConfig.WHATSAPP_MESSAGE} #${orderId}`,
    );
    const waLink = waNumber
      ? `https://wa.me/${waNumber}?text=${message}`
      : null;

    return (
      <div className="py-12 flex flex-col items-center text-center gap-4 px-4">
        <div className="text-6xl">✅</div>
        <h2 className="text-3xl md:text-4xl font-bold">
          {t("orderReceived")}
        </h2>
        <p className="text-xl font-semibold text-gold">
          {t("orderId", { id: orderId })}
        </p>
        <p className="text-text-secondary max-w-md">
          سنتواصل معك خلال 24 ساعة لتأكيد الطلب وتحديد طريقة الدفع
          والاستلام.
        </p>

        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 font-semibold text-white transition hover:opacity-90"
          >
            <FaWhatsapp size={22} />
            تأكيد عبر واتساب
          </a>
        ) : null}

        {appConfig.CONTACT_PHONE ? (
          <a
            href={`tel:${appConfig.CONTACT_PHONE}`}
            className="text-sm text-text-secondary underline underline-offset-4"
          >
            أو اتصل بنا: {appConfig.CONTACT_PHONE}
          </a>
        ) : null}

        <Link
          href="/"
          className="mt-6 underline underline-offset-4 hover:opacity-80"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  if (cartIsEmpty) {
    return (
      <div className="py-12 flex flex-col items-center text-center text-foreground">
        <p className="text-lg font-medium">{t("emptyCart")}</p>
        <Link
          href="/"
          className="mt-4 underline underline-offset-4 hover:opacity-80"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-5xl mx-auto gap-6 my-8 px-4">
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