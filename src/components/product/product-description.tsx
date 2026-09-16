import type { ProductSinglePage } from "@/lib/core/types/types";
import type { SportTheme } from "@/lib/core/util";

import { Price } from "@/components/shared/elements-ssr";
import { ProductPurchaseSection } from "@/components/shared/wrappers";
import { Faq, RichText } from "@/components/ui";

export default function ProductDescription({
  product,
  theme,
}: {
  product: ProductSinglePage;
  theme: SportTheme;
}) {
  const isLongTitle = (product.title || "").length > 30;

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <h1
            className={[
              "break-words font-bold leading-tight",
              isLongTitle ? "text-3xl" : "text-4xl",
            ].join(" ")}
          >
            {product.title}
          </h1>

          <div className="flex lg:justify-end">
            <div
              className="whitespace-nowrap rounded-full px-4 py-1 text-2xl font-bold"
              style={{
                backgroundColor: theme.color,
                color: "#05060a",
                boxShadow: `0 0 20px ${theme.glow}`,
              }}
            >
              {product.purchase_section.variants.length > 0 ? (
                <Price
                  highestAmount={product.purchase_section.priceRange.max}
                  lowestAmount={product.purchase_section.priceRange.min}
                />
              ) : (
                <Price amount={product.purchase_section.price} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          product.purchase_section.variants.length
            ? "min-h-[12rem]"
            : "min-h-[3rem]"
        }
      >
        <ProductPurchaseSection product={product.purchase_section} />
      </div>

      <div className="border-t border-border pt-1 text-[1.125rem] leading-relaxed">
        <RichText
          data={product.description}
          enableGutter={false}
          enableProse={false}
        />
      </div>

      <Faq faqs={product.faqs} title={product.title} />
    </div>
  );
}