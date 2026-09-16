import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Media } from "@/lib/core/types/payload-types";

import DAL from "@/lib/core/dal";
import { getSportTheme } from "@/lib/core/util";

export default async function ShopBySport() {
  const t = await getTranslations("home.shopBySport");
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const media = category.image as Media | undefined;
          const imageUrl = media?.url || "";
          const theme = getSportTheme(category.title);

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              data-sport={theme.key}
              className="sport-card group relative h-64 overflow-hidden rounded-3xl border border-border bg-surface-2"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={category.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div
                  className="mb-2 h-[2px] w-12 rounded-full"
                  style={{
                    backgroundColor: theme.color,
                    boxShadow: `0 0 12px ${theme.glow}`,
                  }}
                />
                <h3 className="text-2xl font-bold text-white">
                  {category.title}
                </h3>
                <span
                  className="mt-2 inline-block text-sm font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {t("explore")} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}