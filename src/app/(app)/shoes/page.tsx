import { getTranslations } from "next-intl/server";

import type { Metadata } from "next";

import SportCard from "@/components/sport/sport-card";
import DAL from "@/lib/core/dal";
import { SportType } from "@/lib/core/types/types";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "الأحذية",
  description: "كل أحذية البادل والتنس — من أفضل الماركات.",
};

export default async function ShoesPage() {
  const t = await getTranslations("sport");
  const productTypes = await DAL.queryProductTypes();

  const shoesType = productTypes.find(
    (pt) => pt.slug === "shoes" || pt.title === "أحذية",
  );

  const [padelShoes, tennisShoes] = await Promise.all([
    DAL.runSportProducts(null, {
      sportType: SportType.PADEL,
      productTypeId: shoesType?.id ?? null,
      limit: 1,
      page: 1,
    }),
    DAL.runSportProducts(null, {
      sportType: SportType.TENNIS,
      productTypeId: shoesType?.id ?? null,
      limit: 1,
      page: 1,
    }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, var(--shoes-green) 0%, transparent 55%)",
          }}
          aria-hidden="true"
        />
        <div className="container relative z-10 py-16 md:py-20">
          <h1 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            {t("shoesTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            {t("shoesSubtitle")}
          </p>
          <div
            className="mt-8 h-[2px] w-32 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--shoes-green) 0%, transparent 100%)",
              boxShadow: "0 0 12px var(--shoes-green)",
            }}
          />
        </div>
      </section>

      <section className="container py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SportCard
            sport={SportType.PADEL}
            title={t("padelShoes")}
            subtitle={t("padelShoesSubtitle")}
            href="/shoes/padel"
            count={padelShoes.totalCount}
          />
          <SportCard
            sport={SportType.TENNIS}
            title={t("tennisShoes")}
            subtitle={t("tennisShoesSubtitle")}
            href="/shoes/tennis"
            count={tennisShoes.totalCount}
          />
        </div>
      </section>
    </div>
  );
}