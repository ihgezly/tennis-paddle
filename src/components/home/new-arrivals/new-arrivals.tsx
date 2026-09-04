import Link from "next/link";
import Image from "next/image";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";
import { getTranslations } from "next-intl/server";

export default async function NewArrivals() {
  const t = await getTranslations("home.newArrivals");
  // نستخدم queryAllProducts مؤقتًا حتى يتم إنشاء queryNewProducts في queries.ts
  const products = (await DAL.queryAllProducts()).slice(0, 10);

  if (!products.length) return null;

  return (
    <section className="container py-16">
      <div className="mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
          {t("title")}
        </h2>
        <p className="mt-3 text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => {
          const imageUrl =
            (product.image as any)?.url || (product.image as any)?.thumbnailURL || "";
          return (
            <Link
              key={product.id}
              href={`/${RoutePath.product}/${product.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-gold/50"
            >
              <div className="relative aspect-square overflow-hidden bg-surface-2">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 text-sm font-medium text-foreground">
                  {product.title}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gold">
                    EGP {((product as any).priceInEGP ?? product.priceInUSD ?? 0)}
                  </span>
                  {(product as any).originalPriceInEGP &&
                    (product as any).originalPriceInEGP > ((product as any).priceInEGP ?? 0) && (
                      <span className="text-sm text-text-muted line-through">
                        EGP {(product as any).originalPriceInEGP}
                      </span>
                    )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}