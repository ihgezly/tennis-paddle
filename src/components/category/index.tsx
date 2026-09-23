import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Category, Product } from "@/lib/core/types/payload-types";

import ProductCard from "@/components/shop/product-card/product-card";
import FiltersSidebar from "@/components/shop/filters/filters-sidebar";
import FiltersToolbar from "@/components/shop/filters/filters-toolbar";
import { RichText } from "@/components/ui";
import DAL from "@/lib/core/dal";
import { getSportTheme } from "@/lib/core/util";

type Props = {
  title: string;
  description: Product["description"] | null;
  products: Product[];
  slug: string;
  currentPage?: number;
  totalPages?: number;
  searchParams?: Record<string, string | undefined>;
  children?: Category[];
};

export default async function CategoryPageLayout({
  title,
  description,
  products,
  slug,
  currentPage = 1,
  totalPages = 1,
  searchParams,
  children = [],
}: Props) {
  const t = await getTranslations("category");
  const category = slug !== "/" ? await DAL.queryCategoryBySlug(slug) : null;
  const brands = await DAL.queryDistinctBrands(category?.id ?? null);

  const isRoot = slug === "/";
  const theme = isRoot
    ? { color: "var(--gold)", glow: "rgba(215,181,109,0.3)" }
    : (() => {
        const th = getSportTheme(category?.title ?? slug);
        return { color: th.color, glow: th.glow };
      })();

  return (
    <div className="container py-12">
      {/* HERO */}
      <div className="mb-10 text-center">
        <h1
          className="text-5xl font-bold uppercase tracking-tight transition-all duration-700 md:text-7xl"
          style={{ textShadow: `0 0 30px ${theme.glow}` }}
        >
          {title}
        </h1>
        <div
          className="mx-auto mt-4 h-[2px] w-24 rounded-full"
          style={{
            backgroundColor: theme.color,
            boxShadow: `0 0 12px ${theme.glow}`,
          }}
        />
        {description ? (
          <div className="mx-auto mt-5 max-w-2xl text-start text-lg text-text-secondary">
            <RichText
              data={description}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        ) : null}
      </div>

      {/* SUBCATEGORIES */}
      {children.length > 0 ? (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {children.map((child) => {
            const childTheme = getSportTheme(child.title);
            return (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                data-sport={childTheme.key}
                className="sport-card flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: childTheme.color,
                    boxShadow: `0 0 6px ${childTheme.glow}`,
                  }}
                />
                {child.title}
              </Link>
            );
          })}
        </div>
      ) : null}

      {/* ✅ Filters Toolbar */}
      <FiltersToolbar
        brands={brands}
        totalCount={products.length}
        displayedCount={products.length}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* ✅ Sidebar — Desktop only */}
        <aside className="hidden lg:block">
          <FiltersSidebar brands={brands} />
        </aside>

        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
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

      {/* PAGINATION */}
      {totalPages > 1 ? (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const params = new URLSearchParams();
            Object.entries(searchParams ?? {}).forEach(([key, value]) => {
              if (value) params.set(key, value);
            });
            params.set("page", String(page));

            const isActive = page === currentPage;

            return (
              <Link
                key={page}
                href={`?${params.toString()}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                  isActive
                    ? "bg-gold text-black shadow-[0_0_14px_rgba(215,181,109,0.5)]"
                    : "bg-surface-2 text-foreground hover:bg-surface-2/60"
                }`}
              >
                {page}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}