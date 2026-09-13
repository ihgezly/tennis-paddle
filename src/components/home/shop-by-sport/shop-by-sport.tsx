import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Media } from "@/lib/core/types/payload-types";

import DAL from "@/lib/core/dal";

export default async function ShopBySport() {
  const t = await getTranslations("home.shopBySport");
  const categories = await DAL.queryCategoriesBasic();

  if (!categories.length) return null;

  return (
    <section className="container py-16">
      <div className="mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
          {t("title")}
        </h2>
        <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const media = category.image as Media | undefined;
          const imageUrl = media?.url || "";

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative h-64 overflow-hidden rounded-3xl border border-border bg-surface-2"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={category.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white">
                  {category.title}
                </h3>
                <span className="mt-2 inline-block text-sm text-white/70 group-hover:text-gold transition">
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