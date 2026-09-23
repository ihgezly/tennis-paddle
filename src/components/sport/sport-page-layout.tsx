import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Product, Media } from "@/lib/core/types/payload-types";
import type { ProductType, SportType } from "@/lib/core/types/types";

import ProductCard from "@/components/shop/product-card/product-card";
import FiltersSidebar from "@/components/shop/filters/filters-sidebar";
import FiltersToolbar from "@/components/shop/filters/filters-toolbar";
import ProductTypeChips from "@/components/sport/product-type-chips";
import SportHero from "@/components/sport/sport-hero";

type Props = {
  sport: SportType | null;
  title: string;
  subtitle?: string;
  basePath: string;
  currentTypeSlug?: string;
  breadcrumb?: Array<{ label: string; href: string }>;
  productTypes: ProductType[];
  products: Product[];
  totalCount: number;
  brands: string[];
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export default async function SportPageLayout({
  sport,
  title,
  subtitle,
  basePath,
  currentTypeSlug,
  breadcrumb,
  productTypes,
  products,
  totalCount,
  brands,
  currentPage,
  totalPages,
  searchParams,
}: Props) {
  const t = await getTranslations("sport");

  const productTypesForFilters = productTypes.map((pt) => ({
    id: pt.id,
    title: pt.title,
    slug: pt.slug,
  }));

  return (
    <div>
      <SportHero
        sport={sport}
        title={title}
        subtitle={subtitle}
        productCount={totalCount}
        breadcrumb={breadcrumb}
      />

      <ProductTypeChips
        productTypes={productTypes}
        basePath={basePath}
        currentTypeSlug={currentTypeSlug}
        sportType={sport}
      />

      <div className="container py-10">
        {/* ✅ Filters Toolbar (mobile + sort + active chips) */}
        <FiltersToolbar
          brands={brands}
          productTypes={productTypesForFilters}
          totalCount={totalCount}
          displayedCount={products.length}
          hideSportFilter={Boolean(sport)}
          hideTypeFilter={Boolean(currentTypeSlug)}
          baseSport={sport ?? undefined}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* ✅ Sidebar — Desktop only */}
          <aside className="hidden lg:block">
            <FiltersSidebar
              brands={brands}
              productTypes={productTypesForFilters}
              hideSportFilter={Boolean(sport)}
              hideTypeFilter={Boolean(currentTypeSlug)}
              baseSport={sport ?? undefined}
            />
          </aside>

          {/* Products */}
          <div>
            {products.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-text-muted">
                  {t("showingCount", {
                    count: products.length,
                    total: totalCount,
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-xl font-semibold">{t("noProducts")}</p>
                <p className="mt-2 text-sm text-text-secondary">
                  {t("noProductsHint")}
                </p>
                <Link
                  href={basePath}
                  className="mt-6 rounded-full bg-volt px-6 py-2 text-sm font-semibold text-[var(--volt-text)]"
                >
                  {t("resetFilters")}
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const params = new URLSearchParams();
                    Object.entries(searchParams ?? {}).forEach(
                      ([key, value]) => {
                        if (value && key !== "page") params.set(key, value);
                      },
                    );
                    params.set("page", String(page));

                    const isActive = page === currentPage;

                    return (
                      <Link
                        key={page}
                        href={`${basePath}${
                          currentTypeSlug ? `/${currentTypeSlug}` : ""
                        }?${params.toString()}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                          isActive
                            ? "bg-volt text-[var(--volt-text)] shadow-[0_0_14px_var(--volt-glow)]"
                            : "bg-surface-2 text-foreground hover:bg-surface-2/60"
                        }`}
                      >
                        {page}
                      </Link>
                    );
                  },
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}