import Link from "next/link";

import type { Product, Media } from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { RoutePath } from "@/lib/core/types/types";

export default function ProductGridItem({ product }: { product: Product }) {
  const { image, priceInUSD, originalPriceInUSD, title, slug } = product;

  const hasDiscount = !!originalPriceInUSD && originalPriceInUSD > priceInUSD!;
  const discountPercent = hasDiscount
    ? Math.round(
        ((originalPriceInUSD! - priceInUSD!) / originalPriceInUSD!) * 100,
      )
    : null;

  return (
    <Link
      href={`/${RoutePath.product}/${slug}`}
      className="relative inline-block h-full w-full group rounded-3xl border border-gray-100 bg-white lg:p-3 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-black"
    >
      <div className="relative">
        <ImageVideo
          className="relative aspect-[3/4] lg:aspect-square rounded-2xl bg-gray-50 dark:bg-neutral-900"
          height={80}
          width={80}
          imgClassName="h-full w-full object-cover rounded-2xl transition duration-300 ease-in-out group-hover:scale-105"
          resource={image as Media}
        />
        {hasDiscount && (
          <span className="absolute top-3 end-1 rounded-full bg-gray-500 px-2.5 py-1 text-xs font-semibold text-white shadow dark:bg-gray-600">
            {discountPercent}%
          </span>
        )}
      </div>

      <div className="font-mono mt-4 flex flex-col gap-1.5 lg:px-1 pb-1">
        <h3 className="line-clamp-2 text-gray-800 dark:text-gray-100">
          {title}
        </h3>
        <div className="flex items-center justify-center gap-2">
          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm dark:text-gray-500">
              <Price amount={originalPriceInUSD!} />
            </span>
          )}
          <span
            className={
              hasDiscount
                ? "font-semibold text-red-600 dark:text-red-400"
                : "text-gray-900 dark:text-gray-100"
            }
          >
            <Price amount={priceInUSD!} />
          </span>
        </div>
      </div>
    </Link>
  );
}
