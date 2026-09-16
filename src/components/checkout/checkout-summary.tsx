"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useTranslations } from "next-intl";

import type {
  Product,
  Variant,
  VariantOption,
  Media,
} from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";

export default function CheckoutSummary() {
  const { cart } = useCart();
  const t = useTranslations("checkout.page");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-lg p-2 lg:p-8">
      <h2 className="text-3xl font-medium">{t("yourCart")}</h2>

      {cart?.items?.map((item, index) => {
        if (typeof item.product !== "object" || !item.product) return null;

        const product: Product = item.product;
        const quantity = item.quantity;
        const variant =
          typeof item.variant === "object"
            ? (item.variant as Variant)
            : undefined;

        if (!quantity) return null;

        const price =
          (variant as any)?.priceInEGP ??
          (product as any).priceInEGP ??
          variant?.priceInUSD ??
          product.priceInUSD;

        const variantLabels =
          variant?.options
            ?.map((o) =>
              typeof o === "object" ? (o as VariantOption).label : null,
            )
            .filter((v): v is string => Boolean(v))
            .join(", ") ?? "";

        return (
          <div className="flex items-start gap-4" key={index}>
            <div className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
              <ImageVideo
                fill
                imgClassName="rounded-lg object-cover"
                resource={product.image as Media}
              />
            </div>

            <div className="flex grow items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium text-foreground">
                  {product.title}
                </p>
                {variantLabels ? (
                  <p className="font-mono text-xs tracking-wide text-text-secondary">
                    {variantLabels}
                  </p>
                ) : null}
                <p className="text-sm text-text-muted">× {quantity}</p>
              </div>

              {typeof price === "number" ? (
                <Price
                  amount={price}
                  className="text-base font-semibold text-gold"
                />
              ) : null}
            </div>
          </div>
        );
      })}

      <hr className="border-border" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-medium uppercase text-text-secondary">
          {t("total")}
        </span>
        <div
          className="rounded-full px-5 py-1.5 text-2xl font-bold"
          style={{
            backgroundColor: "var(--gold)",
            color: "#05060a",
            boxShadow: "0 0 20px rgba(215, 181, 109, 0.4)",
          }}
        >
          <Price amount={cart?.subtotal ?? 0} />
        </div>
      </div>
    </div>
  );
}