"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import CheckoutForm from "@/components/checkout/checkout-form";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import { Button } from "@/components/ui";

export default function CheckoutClient() {
  const t = useTranslations("checkout.page");
  const { cart, clearCart } = useCart();
  const [paymentIframeUrl, setPaymentIframeUrl] = useState<string | null>(null);

  const cartIsEmpty = !cart?.items?.length;

  const cartId = useMemo(() => {
    const id = cart?.id;
    return typeof id === "number" ? id : undefined;
  }, [cart]);

  if (cartIsEmpty && !paymentIframeUrl) {
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

  if (paymentIframeUrl) {
    return (
      <div className="w-full max-w-3xl mx-auto my-8">
        <CheckoutSummary />
        <div className="mt-8">
          <iframe
            src={paymentIframeUrl}
            className="w-full h-[600px] border rounded-md"
            allow="payment"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-5xl mx-auto gap-6 my-8">
      <CheckoutForm
        cartId={cartId}
        clearCart={clearCart}
        onSuccess={(iframeUrl) => setPaymentIframeUrl(iframeUrl)}
      />

      <CheckoutSummary />
    </div>
  );
}