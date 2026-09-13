import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Media, Product } from "@/lib/core/types/payload-types";

import { formatPrice } from "@/lib/core/util";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";

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

  if (ct && newTypeId && Number(ct) === Number(newTypeId)) return 0; // جديد
  if (
    ct &&
    usedTypeId &&
    Number(ct) === Number(usedTypeId) &&
    cg &&
    likeNewGradeId &&
    Number(cg) === Number(likeNewGradeId)
  )
    return 1; // كسر زيرو
  if (ct && usedTypeId && Number(ct) === Number(usedTypeId)) return 2; // مستعمل
  return 3; // غير محدد
};

export default async function NewArrivals() {
  const t = await getTranslations("home.newArrivals");

  const { products, conditionTypes, conditionGrades } =
    await DAL.queryHomeProducts(10);

  if (!products.length) return null;

  const newTypeId =
    conditionTypes.find((c) => c.code === "new")?.id ?? null;
  const usedTypeId =
    conditionTypes.find((c) => c.code === "used")?.id ?? null;
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

  return (
    <section className="container py-16">
      <div className="mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
          {t("title")}
        </h2>
        <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {ordered.map((product) => {
          const media = product.image as Media;
          const imageUrl = media?.url || media?.thumbnailURL || "";

          const priceEGP = (product as any).priceInEGP as number | undefined;
          const originalEGP = (product as any).originalPriceInEGP as
            | number
            | undefined;

          const displayPrice = priceEGP ?? product.priceInUSD ?? 0;
          const hasDiscount =
            originalEGP != null &&
            priceEGP != null &&
            originalEGP > priceEGP;

          const ct = product.conditionType as any;
          const conditionLabel =
            ct?.code === "new"
              ? "جديد"
              : ct?.code === "used"
                ? "مستعمل"
                : null;

          return (
            <Link
              key={product.id}
              href={`/${RoutePath.product}/${product.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-gold/50"
            >
              <div className="relative aspect-square overflow-hidden bg-surface-2">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : null}

                {conditionLabel ? (
                  <span className="absolute top-2 start-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {conditionLabel}
                  </span>
                ) : null}

                {hasDiscount ? (
                  <span className="absolute top-2 end-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                    -
                    {Math.round(
                      ((originalEGP! - priceEGP!) / originalEGP!) * 100,
                    )}
                    %
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
        })}
      </div>
    </section>
  );
}