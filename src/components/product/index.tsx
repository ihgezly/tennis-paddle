import { getTranslations } from "next-intl/server";

import type { ProductSinglePage } from "@/lib/core/types/types";
import { getSportTheme } from "@/lib/core/util";

import Gallery from "@/components/product/gallery";
import ProductGridItem from "@/components/product/grid/product-grid-item";
import ProductDescription from "@/components/product/product-description";
import ProductReviews from "@/components/product/review";
import {
  AutoScrollRow,
  BackButton,
  GlbViewerClient,
} from "@/components/shared/wrappers";

export default async function ProductPageLayout({
  product,
}: {
  product: ProductSinglePage & { glbModel?: any };
}) {
  const t = await getTranslations("product");
  const glbUrl = (product.glbModel as any)?.url as string | undefined;

  // ✅ جديد — نحسب الـ theme من أول قسم في المنتج
  const firstCategory = product.categories?.[0];
  const categoryIdentifier =
    firstCategory && typeof firstCategory === "object"
      ? firstCategory.slug || firstCategory.title
      : undefined;
  const theme = getSportTheme(categoryIdentifier);

  return (
    <div className="container pb-2">
      <BackButton />

      <div className="flex flex-col gap-12 rounded-lg border border-t-0 p-8 lg:flex-row lg:gap-8">
        <div className="basis-full lg:basis-1/2">
          {/* ✅ نمرر الـ theme */}
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
          <h3 className="mb-4 text-lg font-semibold">
            {t("view3d") || "معاينة ثلاثية الأبعاد"}
          </h3>
          <div className="overflow-hidden rounded-lg">
            {/* ✅ نمرر accentHex كمان لو GlbViewer يدعمه */}
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