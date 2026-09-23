import Image from "next/image";
import Link from "next/link";

import type { Product, Media } from "@/lib/core/types/payload-types";

import ConditionBadge from "@/components/shared/condition-badge";
import { RoutePath } from "@/lib/core/types/types";
import { formatPrice } from "@/lib/core/util";

export default function ProductCard({ product }: { product: Product }) {
  const { image, title, slug } = product;
  const media = image as Media;
  const imageUrl = media?.url || media?.thumbnailURL || "";

  const priceEGP = (product as any).priceInEGP as number | undefined;
  const originalEGP = (product as any).originalPriceInEGP as number | undefined;

  // ✅ EGP فقط
  const displayPrice = priceEGP ?? 0;
  const hasDiscount =
    originalEGP != null && priceEGP != null && originalEGP > priceEGP;
  const discountPercent = hasDiscount
    ? Math.round(((originalEGP! - priceEGP!) / originalEGP!) * 100)
    : null;

  const brand = (product as any).brand as string | null | undefined;

  return (
    <Link
      href={`/${RoutePath.product}/${slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-gold/40 hover:shadow-[0_0_28px_rgba(215,181,109,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}

        <ConditionBadge
          conditionType={product.conditionType as any}
          conditionGrade={product.conditionGrade as any}
          className="absolute top-2 start-2"
        />

        {hasDiscount ? (
          <span className="absolute end-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="p-4">
        {brand ? (
          <p className="text-[11px] uppercase tracking-wider text-text-muted">
            {brand}
          </p>
        ) : null}
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
          {title}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gold">
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount ? (
            <span className="text-xs text-text-muted line-through">
              {formatPrice(originalEGP!)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}