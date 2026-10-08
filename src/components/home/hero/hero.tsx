import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiArrowRight, FiStar } from "react-icons/fi";

import type { Media, Product } from "@/lib/core/types/payload-types";

import HeroSearch from "@/components/home/hero/hero-search";
import HeroVideo from "@/components/home/hero/hero-video";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";

const fmt = (n: unknown) =>
  Number.isFinite(Number(n)) && Number(n) > 0
    ? `${Number(n).toLocaleString("en-US")} ج.م`
    : null;

export default async function Hero() {
  const t = await getTranslations("hero");

  let products: Product[] = [];
  try {
    const all = await DAL.queryAllProducts();
    products = all.filter((p) => (p.image as Media)?.url).slice(0, 10);
  } catch {
    products = [];
  }

  const settings: any = await DAL.querySiteSettings().catch(() => null);
  const bg = settings?.home?.heroBackground as Media | undefined;

  return (
    <section className="relative">
      <HeroVideo image={bg} />

      <div className="container relative z-10 flex flex-col items-center gap-10 py-14 text-center lg:gap-12 lg:py-20">
        {/* ── 1) العنوان + البحث + الأزرار ── */}
        <div className="flex w-full flex-col items-center gap-7">
          <h1 className="hero-title hero-rise">
            <span className="block">العب بشكل</span>
            <span className="mt-1 block">مختلف.</span>
          </h1>

          <p
            className="hero-rise max-w-xl text-lg leading-relaxed text-text-secondary"
            style={{ "--d": "0.15s" } as React.CSSProperties}
          >
            {t("subtitle") ||
              "اكتشف أحدث معدات البادل والتنس والأحذية — من أفضل الماركات العالمية، بأسعار تناسبك."}
          </p>

          <div
            className="hero-rise w-full"
            style={{ "--d": "0.25s" } as React.CSSProperties}
          >
            <HeroSearch />
          </div>

          <div
            className="hero-rise flex flex-col justify-center gap-3 sm:flex-row"
            style={{ "--d": "0.35s" } as React.CSSProperties}
          >
            <Link
              href="/categories"
              className="group volt-cta inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 font-bold"
            >
              تسوق الآن
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-full border border-border-strong bg-surface/60 px-9 py-4 font-semibold text-foreground backdrop-blur-sm transition hover:border-volt hover:shadow-[0_0_22px_var(--volt-glow)]"
            >
              بِع معداتك
            </Link>
          </div>
        </div>

        {/* ── 2) الصور: 4 ظاهرة وبتتحرك ── */}
        <HeroMarquee products={products} />

        {/* ── 3) التقييم + الإحصائيات ── */}
        <div
          className="hero-stats hero-rise"
          style={{ "--d": "0.5s" } as React.CSSProperties}
        >
          <div className="hero-stats__item">
            <span className="hero-stats__value">
              <FiStar className="h-5 w-5 fill-volt text-foreground" />
              4.9
            </span>
            <span className="hero-stats__label">تقييم العملاء</span>
          </div>
          <div className="hero-stats__item">
            <span className="hero-stats__value">50+</span>
            <span className="hero-stats__label">منتج</span>
          </div>
          <div className="hero-stats__item">
            <span className="hero-stats__value">20+</span>
            <span className="hero-stats__label">ماركة</span>
          </div>
          <div className="hero-stats__item">
            <span className="hero-stats__value">1000+</span>
            <span className="hero-stats__label">عميل سعيد</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMarquee({ products }: { products: Product[] }) {
  let items = products;
  if (!items.length) return null;
  while (items.length < 8) items = [...items, ...items];
  const loop = [...items, ...items]; // النصف التاني نسخة → لفّة من غير قطع

  return (
    <div dir="ltr" className="hero-marquee">
      <div
        className="hero-marquee__track"
        style={{ "--n": items.length } as React.CSSProperties}
      >
        {loop.map((p, i) => {
          const m = p.image as Media;
          const price = fmt((p as any).priceInEGP);
          return (
            <Link
              key={`${p.id}-${i}`}
              href={`/${RoutePath.product}/${p.slug}`}
              className="hero-marquee__tile"
              aria-hidden={i >= items.length ? true : undefined}
              tabIndex={i >= items.length ? -1 : undefined}
            >
              <Image
                src={m.url!}
                alt={p.title}
                fill
                sizes="(min-width:1024px) 290px, 45vw"
                className="hero-marquee__img"
              />
              <span className="hero-marquee__cap">
                <span className="hero-marquee__name">{p.title}</span>
                {price ? <span className="hero-marquee__price">{price}</span> : null}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}