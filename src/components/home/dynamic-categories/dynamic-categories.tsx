import Link from "next/link";
import { getTranslations } from "next-intl/server";

import DAL from "@/lib/core/dal";
import { getSportTheme } from "@/lib/core/util";

export default async function DynamicCategories() {
  const t = await getTranslations("home.dynamicCategories");
  const categories = await DAL.queryCategoriesBasic();

  if (!categories.length) return null;

  return (
    <section className="container py-24">
      <div className="mb-14 text-center">
        <h2 className="text-4xl font-bold tracking-tight uppercase md:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => {
          const theme = getSportTheme(category.title);

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              data-sport={theme.key}
              className="sport-card group flex items-center gap-2.5 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground"
            >
              <span
                className="h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-125"
                style={{
                  backgroundColor: theme.color,
                  boxShadow: `0 0 8px ${theme.glow}`,
                }}
              />
              {category.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}