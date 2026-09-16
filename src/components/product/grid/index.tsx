import { getTranslations } from "next-intl/server";

import type { ProductSinglePage } from "@/lib/core/types/types";

import Gallery from "@/components/product/gallery";
import ProductGridItem from "@/components/product/grid/product-grid-item";
import ProductDescription from "@/components/product/product-description";
import ProductReviews from "@/components/product/review";
import {
  AutoScrollRow,
  BackButton,
  GlbViewerClient,
} from "@/components/shared/wrappers";
import { getSportTheme } from "@/lib/core/util";

export default async function ProductPageLayout({
  product,
}: {
  product: ProductSinglePage & { glbModel?: any };
}) {
  const t = await getTranslations("product");
  const glbUrl = (product.glbModel as any)?.url as string | undefined;

  // احسب ثيم المنتج من أول قسم
  const firstCategory = Array.isArray(product.categories)
    ? product.categories[0]
    : null;
  const categoryLabel =
    firstCategory && typeof firstCategory === "object"
      ? (firstCategory as any).title || (firstCategory as any).slug || ""
      : "";

  const theme = getSportTheme(categoryLabel);

  return (
    <div
      className="container pb-2"
      style={{
        ["--product-accent" as any]: theme.color,
        ["--product-glow" as any]: theme.glow,
      }}
    >
      <BackButton />

      <div className="flex flex-col gap-12 rounded-lg border border-t-0 border-border p-8 lg:flex-row lg:gap-8">
        <div className="basis-full lg:basis-1/2">
          <ProductDescription product={product} theme={theme} />
        </div>
        <div className="h-full w-full basis-full lg:basis-1/2">
          <div className="min-h-[32rem] w-full">
            <Gallery gallery={product.gallery || []} />
          </div>
        </div>
      </div>

      {glbUrl ? (
        <div className="mt-8 rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: theme.color,
                boxShadow: `0 0 8px ${theme.glow}`,
              }}
            />
            {t("view3d") || "معاينة ثلاثية الأبعاد"}
          </h3>
          <div className="overflow-hidden rounded-lg">
            <GlbViewerClient url={glbUrl} accentHex={theme.hex} />
          </div>
        </div>
      ) : null}

      {product.relatedProducts?.length ? (
        <div className="pt-8">
          <h3 className="mb-4 text-lg font-semibold">
            {t("relatedProducts")}
          </h3>
          <AutoScrollRow className="snap-x snap-proximity">
            {product.relatedProducts.map((p) => (
              <div
                key={p.id}
                className="min-w-0 max-w-[21rem] flex-[0_0_82%] sm:flex-[0_0_48%] md:flex-[0_0_31%] lg:max-w-[20rem] lg:flex-[0_0_23%]"
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