import { getTranslations } from "next-intl/server";
import type { Product } from "@/lib/core/types/payload-types";
import ProductCard from "@/components/shop/product-card/product-card";
import FiltersToolbar from "@/components/shop/filters/filters-toolbar";
import BrandFilter from "@/components/shop/filters/brand-filter";
import ConditionFilter from "@/components/shop/filters/condition-filter";
import PriceFilter from "@/components/shop/filters/price-filter";
import DAL from "@/lib/core/dal";
import { RichText } from "@/components/ui";

type Props = {
  title: string;
  description: Product["description"] | null;
  products: Product[];
  slug: string;
  currentPage?: number;
  totalPages?: number;
  searchParams?: Record<string, string | undefined>;
};

export default async function CategoryPageLayout({
  title,
  description,
  products,
  slug,
  currentPage = 1,
  totalPages = 1,
  searchParams,
}: Props) {
  const t = await getTranslations("category");
  const category = slug !== "/" ? await DAL.queryCategoryBySlug(slug) : null;
  const brands = await DAL.queryDistinctBrands(category?.id ?? null);

  return (
    <div className="container py-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase">
          {title}
        </h1>
        {description ? (
          <div className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto text-start">
            <RichText data={description} enableGutter={false} enableProse={false} />
          </div>
        ) : null}
      </div>

      <div className="mb-6 lg:hidden">
        <FiltersToolbar brands={brands} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden lg:block space-y-8 border-r border-border pr-8">
          <BrandFilter brands={brands} />
          <ConditionFilter />
          <PriceFilter />
        </aside>

        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-text-secondary">
              {t("noProducts")}
            </p>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const params = new URLSearchParams();
            Object.entries(searchParams ?? {}).forEach(([key, value]) => {
              if (value) params.set(key, value);
            });
            params.set("page", String(page));
            return (
              <a
                key={page}
                href={`?${params.toString()}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-gold text-black"
                    : "bg-surface-2 text-foreground hover:bg-surface-2/60"
                }`}
              >
                {page}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}