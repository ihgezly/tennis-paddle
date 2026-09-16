import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Media, Product } from "@/lib/core/types/payload-types";

import NewArrivalsCarousel from "@/components/home/new-arrivals/new-arrivals-carousel";
import ConditionBadge from "@/components/shared/condition-badge";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";
import { formatPrice } from "@/lib/core/util";

type ScoredProduct = {
  product: Product;
  score: number;
};

const getConditionScore = (
  product: Product,
  newTypeId: number | null,
  usedTypeId: number | null,
  likeNewGradeId: number | null,
): number => {
  const ct =
    typeof product.conditionType === "object"
      ? (product.conditionType as any)?.id
      : product.conditionType;

  const cg =
    typeof product.conditionGrade === "object"
      ? (product.conditionGrade as any)?.id
      : product.conditionGrade;

  if (ct && newTypeId && Number(ct) === Number(newTypeId)) return 0;
  if (
    ct &&
    usedTypeId &&
    Number(ct) === Number(usedTypeId) &&
    cg &&
    likeNewGradeId &&
    Number(cg) === Number(likeNewGradeId)
  )
    return 1;
  if (ct && usedTypeId && Number(ct) === Number(usedTypeId)) return 2;
  return 3;
};

export default async function NewArrivals() {
  const t = await getTranslations("home.newArrivals");

  const { products, conditionTypes, conditionGrades } =
    await DAL.queryHomeProducts(10);

  if (!products.length) return null;

  const newTypeId = conditionTypes.find((c) => c.code === "new")?.id ?? null;
  const usedTypeId = conditionTypes.find((c) => c.code === "used")?.id ?? null;
  const likeNewGradeId =
    conditionGrades.find((g) => g.code === "like_new")?.id ?? null;

  const scored: ScoredProduct[] = products
    .map((product) => ({
      product,
      score: getConditionScore(
        product,
        newTypeId,
        usedTypeId,
        likeNewGradeId,
      ),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return (
        new Date(b.product.updatedAt).getTime() -
        new Date(a.product.updatedAt).getTime()
      );
    });

  const ordered = scored.map((s) => s.product);

  const cards = ordered.map((product, i) => {
    const media = product.image as Media;
    const imageUrl = media?.url || media?.thumbnailURL || "";

    const priceEGP = (product as any).priceInEGP as number | undefined;
    const originalEGP = (product as any).originalPriceInEGP as
      | number
      | undefined;

    const displayPrice = priceEGP ?? product.priceInUSD ?? 0;
    const hasDiscount =
      originalEGP != null && priceEGP != null && originalEGP > priceEGP;
    const discountPercent = hasDiscount
      ? Math.round(((originalEGP! - priceEGP!) / originalEGP!) * 100)
      : null;

    return (
      <Link
        key={product.id}
        href={`/${RoutePath.product}/${product.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-gold/40 hover:shadow-[0_0_32px_rgba(215,181,109,0.15)]"
        style={{
          animation: `card-fade-in 0.5s ${i * 0.04}s ease-out both`,
        }}
      >
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 32vw, 70vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : null}

          <ConditionBadge
            conditionType={product.conditionType as any}
            conditionGrade={product.conditionGrade as any}
            className="absolute top-2 start-2"
          />

          {hasDiscount ? (
            <span className="absolute end-2 top-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
            {product.title}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-gold">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount ? (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(originalEGP!)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    );
  });

  return (
    <section className="container py-16">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold tracking-tight uppercase md:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
      </div>

      <NewArrivalsCarousel>{cards}</NewArrivalsCarousel>
    </section>
  );
}