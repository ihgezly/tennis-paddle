import Link from "next/link";
import Image from "next/image";

import type { Product, Media } from "@/lib/core/types/payload-types";
import { RoutePath } from "@/lib/core/types/types";

export default function ProductCard({ product }: { product: Product }) {
  const { image, title, slug } = product;
  const imageUrl = (image as Media)?.url;

  const hasEGPPrice = (product as any).priceInEGP != null;

  const price = hasEGPPrice
    ? (product as any).priceInEGP!
    : product.priceInUSD ?? 0;

  // استخدام originalPriceInEGP فقط
  const originalPrice = (product as any).originalPriceInEGP ?? undefined;

  const currency = hasEGPPrice ? "EGP" : "USD";

  const hasDiscount =
    originalPrice != null && originalPrice > price;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const conditionType = (product as any).conditionType;
  const brand = (product as any).brand;

  return (
    <Link
      href={`/${RoutePath.product}/${slug}`}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-gold/50"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}
        {conditionType && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {conditionType.code === "new" ? "New" : "Used"}
          </span>
        )}
      </div>

      <div className="p-4">
        {brand && (
          <p className="text-xs text-text-muted uppercase tracking-wider">
            {brand}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
          {title}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-sm text-text-muted line-through">
              {currency} {originalPrice}
            </span>
          )}
          <span className="text-lg font-bold text-gold">
            {currency} {price}
          </span>
        </div>
      </div>
    </Link>
  );
}