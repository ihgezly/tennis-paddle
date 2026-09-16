"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { HiXMark } from "react-icons/hi2";

import {
  DeleteItemButton,
  EditItemQuantityButton,
  OpenCartButton,
} from "./cart-controls";

import type { Cart, Media } from "@/lib/core/types/payload-types";

import ConditionBadge from "@/components/shared/condition-badge";
import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { buildCartRows, getCartQuantity } from "@/lib/core/adapter";
import { RoutePath } from "@/lib/core/types/types";
import { cn } from "@/lib/core/util";

export const CART_OPEN_EVENT = "cart:open";

export const openCart = () => {
  window.dispatchEvent(new Event(CART_OPEN_EVENT));
};

const EmptyCartIcon = () => (
  <svg viewBox="0 0 48 48" className="h-14 w-14 text-text-muted" fill="none">
    <path
      d="M6 8h4l3 22a3 3 0 0 0 3 2.6h18a3 3 0 0 0 3-2.5L40 16H12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="18" cy="40" r="2.5" fill="currentColor" />
    <circle cx="32" cy="40" r="2.5" fill="currentColor" />
  </svg>
);

export default function CartModal() {
  const t = useTranslations("cart");
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // فتح من خارج (add-to-cart)
  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CART_OPEN_EVENT, onOpen);
  }, []);

  // قفل السكرول
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape يقفل
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const totalQuantity = useMemo(
    () => getCartQuantity(cart as Cart | null | undefined),
    [cart],
  );
  const rows = useMemo(() => buildCartRows(cart), [cart]);

  if (!mounted) return null;

  return (
    <>
      {/* Trigger */}
      <OpenCartButton
        quantity={totalQuantity}
        onClick={() => setIsOpen(true)}
      />

      {/* Overlay — فقط لما يفتح */}
      {isOpen ? (
        <div
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          style={{ animation: "fade-in 0.2s ease-out" }}
        />
      ) : null}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "cart-drawer fixed inset-y-0 end-0 z-50 flex w-5/6 flex-col gap-4 border-s border-border bg-surface text-foreground shadow-2xl sm:max-w-sm",
          "transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-x-0"
            : "ltr:translate-x-full rtl:-translate-x-full",
        )}
        style={{
          visibility: isOpen ? "visible" : "hidden",
          transitionProperty: "transform, visibility",
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{t("title")}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق السلة"
              className="rounded p-1 text-foreground/70 transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-text-secondary">{t("description")}</p>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <EmptyCartIcon />
            <p className="text-lg font-semibold text-foreground">
              {t("emptyTitle")}
            </p>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gold underline underline-offset-4 hover:opacity-80"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="flex min-h-0 grow px-4">
            <div className="flex min-h-0 w-full flex-col">
              <ul className="min-h-0 grow overflow-y-auto py-4">
                {rows.map(({ item, data }, i) => {
                  const { product, variant, isVariant, price } = data;
                  const productAny = product as any;

                  return (
                    <li className="flex w-full flex-col" key={i}>
                      <div className="relative flex w-full flex-row justify-between gap-2 px-1 py-4">
                        <div className="absolute z-40 -mt-2 ms-[55px]">
                          <DeleteItemButton item={item} />
                        </div>

                        <Link
                          className="z-30 flex flex-1 flex-row gap-4"
                          href={`/${RoutePath.product}/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
                            <ImageVideo
                              className="h-full w-full object-cover"
                              resource={product.image as Media}
                            />
                          </div>

                          <div className="flex flex-1 flex-col gap-1.5 text-base">
                            <span className="line-clamp-2 leading-tight text-foreground">
                              {product.title}
                            </span>

                            <ConditionBadge
                              conditionType={productAny.conditionType}
                              conditionGrade={productAny.conditionGrade}
                              size="sm"
                              className="w-fit"
                            />

                            {isVariant && variant ? (
                              <p className="text-xs capitalize text-text-secondary">
                                {Array.isArray(variant.options)
                                  ? variant.options
                                      .map((o) =>
                                        typeof o === "object" &&
                                        o &&
                                        "label" in o
                                          ? (o as { label: string }).label
                                          : null,
                                      )
                                      .filter((x): x is string => Boolean(x))
                                      .join(", ")
                                  : ""}
                              </p>
                            ) : null}
                          </div>
                        </Link>

                        <div className="flex h-16 shrink-0 flex-col justify-between">
                          {typeof price === "number" ? (
                            <Price
                              amount={price}
                              className="text-right text-sm text-foreground"
                            />
                          ) : null}

                          <div className="ms-auto flex h-9 flex-row items-center rounded-lg border border-border">
                            <EditItemQuantityButton item={item} type="minus" />
                            <p className="w-6 text-center">
                              <span className="w-full text-sm text-foreground">
                                {item.quantity}
                              </span>
                            </p>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-border px-1 py-4">
                {typeof cart?.subtotal === "number" ? (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm uppercase tracking-wide text-text-secondary">
                      {t("total")}
                    </p>
                    <div
                      className="rounded-full px-4 py-1 text-lg font-bold"
                      style={{
                        backgroundColor: "var(--gold)",
                        color: "#05060a",
                        boxShadow: "0 0 16px rgba(215, 181, 109, 0.4)",
                      }}
                    >
                      <Price amount={cart.subtotal} />
                    </div>
                  </div>
                ) : null}

                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-gold px-6 py-3 font-semibold text-black transition hover:bg-gold/85"
                >
                  {t("checkout")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}