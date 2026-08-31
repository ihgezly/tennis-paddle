import { getTranslations } from "next-intl/server";

import type { ProductSinglePage } from "@/lib/core/types/types";

import Gallery from "@/components/product/gallery";
import ProductGridItem from "@/components/product/grid/product-grid-item";
import ProductDescription from "@/components/product/product-description";
import ProductReviews from "@/components/product/review";
import { AutoScrollRow, BackButton } from "@/components/shared/wrappers";

export default async function ProductPageLayout({
  product,
}: {
  product: ProductSinglePage & { glbModel?: { url?: string } | null };
}) {
  const t = await getTranslations("product");

  return (
    <div className="container pb-2">
      <BackButton />

      <div className="flex flex-col gap-12 rounded-lg border border-t-0 p-8 lg:flex-row lg:gap-8">
        <div className="basis-full lg:basis-1/2">
          <ProductDescription product={product} />
        </div>
        <div className="h-full w-full basis-full lg:basis-1/2">
          <div className="min-h-[32rem] w-full">
            <Gallery gallery={product.gallery || []} glbModel={product.glbModel} />
          </div>
        </div>
      </div>
      {product.relatedProducts?.length ? (
        <div className="pt-8">
          <h3 className="mb-4 text-lg font-semibold">{t("relatedProducts")}</h3>
          <AutoScrollRow className="snap-x snap-proximity">
            {product.relatedProducts.map((p) => (
              <div
                key={p.id}
                className="min-w-0 flex-[0_0_82%] max-w-[21rem] sm:flex-[0_0_48%] md:flex-[0_0_31%] lg:flex-[0_0_23%] lg:max-w-[20rem]"
              >
                <ProductGridItem product={p} />
              </div>
            ))}
          </AutoScrollRow>
        </div>
      ) : null}
      <ProductReviews reviews={product.reviews} productId={product.id} />
    </div>
  );
}