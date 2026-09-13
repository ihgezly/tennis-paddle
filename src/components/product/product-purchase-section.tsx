"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { ProductPurchaseSectionData } from "@/lib/core/types/types";

import AddToCart from "@/components/cart/add-to-cart";
import { Price } from "@/components/shared/elements-ssr";
import { Button } from "@/components/ui";
import { cn, createUrl } from "@/lib/core/util";

export default function ProductPurchaseSectionClient({
  product,
}: {
  product: ProductPurchaseSectionData & {
    conditionType?: { code: string; nameAr?: string; nameEn?: string } | null;
    conditionGrade?: { code: string; nameAr?: string; nameEn?: string } | null;
    conditionNotes?: string | null;
    glbModel?: { url?: string } | null;
  };
}) {
  const hasVariants = product.variants.length > 0;

  return (
    <>
      {product.conditionType ? (
        <div className="flex flex-col gap-2 py-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-medium">
              {product.conditionType.nameAr || product.conditionType.nameEn || product.conditionType.code}
              {product.conditionGrade
                ? ` - ${product.conditionGrade.nameAr || product.conditionGrade.nameEn || product.conditionGrade.code}`
                : ""}
            </span>
          </div>
          {product.conditionNotes ? (
            <p className="text-sm text-muted-foreground">{product.conditionNotes}</p>
          ) : null}
        </div>
      ) : null}

      {hasVariants ? (
        <div className="flex flex-col gap-6 border-b pb-2">
          <VariantSelector product={product} />
        </div>
      ) : null}

      <div className="flex items-center justify-between py-4 md:justify-center">
        <StockIndicator product={product} />
      </div>

      <div className="flex items-center justify-center pb-2">
        <AddToCart product={product} />
      </div>
    </>
  );
}

const VariantSelector = ({
  product,
}: {
  product: ProductPurchaseSectionData;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      {product.variants.map((type) => (
        <dl key={type.typeId} className="mb-6">
          <dt className="mb-3 text-[15px] font-medium text-gray-900">
            {type.typeLabel}
          </dt>

          <dd className="flex flex-wrap gap-2.5">
            {type.options.map((option) => {
              const hasDiscount =
                !!option.originalPrice && option.originalPrice > option.price;
              const isSelected = searchParams.get("variant") === option.id;

              return (
                <Button
                  key={option.id}
                  variant="select"
                  size="clear"
                  selected={isSelected}
                  disabled={option.inventory <= 0}
                  className={cn(
                    "min-w-[84px] px-4 py-2.5 flex flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] transition-all disabled:opacity-45 disabled:cursor-not-allowed",
                    isSelected ? "border-gray-900" : "border-gray-200",
                  )}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("variant", option.id);
                    router.replace(createUrl(pathname, params), {
                      scroll: false,
                    });
                  }}
                >
                  <p className="text-base font-medium">{option.label}</p>

                  <div className="flex items-baseline gap-1.5">
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        <Price amount={option.originalPrice} />
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-[13px] font-medium",
                        hasDiscount && "text-red-600",
                      )}
                    >
                      <Price amount={option.price} />
                    </span>
                  </div>
                </Button>
              );
            })}
          </dd>
        </dl>
      ))}
    </>
  );
};

const StockIndicator = ({
  product,
}: {
  product: ProductPurchaseSectionData;
}) => {
  const t = useTranslations("product.stock");
  const searchParams = useSearchParams();

  const selectedVariant = useMemo(() => {
    const variantId = searchParams.get("variant");
    if (!variantId) return null;

    for (const group of product.variants) {
      const hit = group.options.find((o) => o.id === String(variantId));
      if (hit) return hit;
    }

    return null;
  }, [product.variants, searchParams]);

  const hasVariants = product.variants.length > 0;
  if (hasVariants && !selectedVariant) return null;

  const stockQuantity = hasVariants
    ? selectedVariant!.inventory
    : Number(product.inventory ?? 0);

  const stockMessage =
    stockQuantity > 0 && stockQuantity < 10
      ? t("onlyLeft", { count: stockQuantity })
      : stockQuantity > 0
        ? t("inStock")
        : t("outOfStock");

  return (
    <p className="uppercase font-mono text-sm font-medium text-gray-500">
      {stockMessage}
    </p>
  );
};