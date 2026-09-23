import Link from "next/link";

import type { Product, Media } from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ConditionBadge from "@/components/shared/condition-badge";
import ImageVideo from "@/components/shared/image-video";
import { RoutePath } from "@/lib/core/types/types";

export default function ProductGridItem({ product }: { product: Product }) {
  // ✅ شيلنا priceInUSD من الـdestructuring
  const { image, title, slug } = product;

  const priceEGP = (product as any).priceInEGP as number | undefined;
  const originalEGP = (product as any).originalPriceInEGP as number | undefined;

  // ✅ EGP فقط
  const displayPrice = priceEGP ?? 0;
  const hasDiscount =
    originalEGP != null && priceEGP != null && originalEGP > priceEGP;
  const discountPercent = hasDiscount
    ? Math.round(((originalEGP! - priceEGP!) / originalEGP!) * 100)
    : null;

  return (
    <Link
      href={`/${RoutePath.product}/${slug}`}
      className="group relative inline-block h-full w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-all duration-500 hover:shadow-[0_0_28px_rgba(215,181,109,0.12)] lg:p-3"
    >
      <div className="relative">
        <ImageVideo
          className="relative aspect-[3/4] rounded-2xl bg-surface-2 lg:aspect-square"
          height={80}
          width={80}
          imgClassName="h-full w-full object-cover rounded-2xl transition duration-500 ease-in-out group-hover:scale-105"
          resource={image as Media}
        />

        <ConditionBadge
          conditionType={product.conditionType as any}
          conditionGrade={product.conditionGrade as any}
          size="sm"
          className="absolute top-2 start-2"
        />

        {hasDiscount ? (
          <span className="absolute end-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            -{discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-1.5 px-1 pb-1 lg:px-1">
        <h3 className="line-clamp-2 text-sm text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <span className="text-xs text-text-muted line-through">
              <Price amount={originalEGP!} />
            </span>
          ) : null}
          <span
            className={
              hasDiscount
                ? "font-semibold text-red-500"
                : "font-semibold text-gold"
            }
          >
            <Price amount={displayPrice} />
          </span>
        </div>
      </div>
    </Link>
  );
}