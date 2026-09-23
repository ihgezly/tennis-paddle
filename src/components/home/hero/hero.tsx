import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiArrowRight, FiStar } from "react-icons/fi";

import type { Media, Product } from "@/lib/core/types/payload-types";

import HeroSearch from "@/components/home/hero/hero-search";
import HeroVideo from "@/components/home/hero/hero-video";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";

export default async function Hero() {
  const t = await getTranslations("hero");

  let featured: Product[] = [];
  try {
    const all = await DAL.queryAllProducts();
    featured = all.slice(0, 4);
  } catch {
    featured = [];
  }

  while (featured.length < 4) {
    featured.push(featured[0] ?? ({} as Product));
  }

  const totalProducts = featured.filter((p) => p?.id).length || 0;

  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      {/* ✅ keyframes محلية للـhero */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>

      <HeroVideo />

      <div className="container relative z-10 py-12 lg:py-20">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* ═══════════ LEFT ═══════════ */}
          <div className="flex-1 space-y-8 text-center lg:text-start">
            {/* ✅ Rating badge — جديد */}
            <div
              className="inline-flex items-center gap-3 rounded-full border border-volt/20 bg-surface/70 px-5 py-2 text-xs text-text-secondary backdrop-blur-md"
              style={{
                animation: "logo-in 0.6s ease-out both",
                boxShadow: "0 0 24px rgba(212, 255, 0, 0.15)",
              }}
            >
              <div className="flex items-center gap-1">
                <FiStar className="h-3.5 w-3.5 fill-volt text-volt" />
                <span className="font-bold text-foreground">4.9</span>
              </div>
              <span className="h-3 w-px bg-border" />
              <span className="font-medium">معدات أصلية 100%</span>
              <span
                className="ms-1 h-2 w-2 rounded-full bg-volt"
                style={{
                  boxShadow: "0 0 8px var(--volt-glow)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
                aria-hidden="true"
              />
            </div>

            {/* ✅ Title — gradient متحرك */}
            <div className="space-y-4">
              <h1
                className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--padel-blue) 0%, var(--volt) 45%, var(--tennis-orange) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% 200%",
                  animationName: "logo-in, gradient-shift",
                  animationDuration: "0.8s, 6s",
                  animationTimingFunction: "ease-out, ease-in-out",
                  animationIterationCount: "1, infinite",
                  animationFillMode: "both, none",
                }}
              >
                <span className="block">العب بشكل</span>
                <span className="mt-2 block">مختلف.</span>
              </h1>

              <p
                className="mx-auto max-w-xl text-lg text-text-secondary lg:mx-0"
                style={{ animation: "logo-in 0.8s 0.2s ease-out both" }}
              >
                {t("subtitle") ||
                  "اكتشف أحدث معدات البادل والتنس والأحذية — من أفضل الماركات العالمية، بأسعار تناسبك."}
              </p>
            </div>

            <div style={{ animation: "logo-in 0.8s 0.3s ease-out both" }}>
              <HeroSearch />
            </div>

            {/* CTAs */}
            <div
              className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
              style={{ animation: "logo-in 0.8s 0.4s ease-out both" }}
            >
              <Link
                href="/categories"
                className="group volt-cta inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold"
              >
                تسوق الآن
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/sell"
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface/50 px-8 py-4 font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold"
              >
                بِع معداتك
              </Link>
            </div>
          </div>

          {/* ═══════════ RIGHT ═══════════ */}
          <div
            className="relative w-full flex-1 lg:max-w-[520px]"
            style={{ animation: "logo-in 0.8s 0.3s ease-out both" }}
          >
            <div className="grid grid-cols-2 gap-4 pb-16">
              <div className="space-y-4">
                <HeroTile product={featured[0]} height="h-[200px]" />
                <HeroTile product={featured[1]} height="h-[280px]" />
              </div>
              <div className="space-y-4 pt-10">
                <HeroTile product={featured[2]} height="h-[280px]" />
                <HeroTile product={featured[3]} height="h-[200px]" />
              </div>
            </div>

            <div
              className="absolute inset-x-6 -bottom-2 rounded-2xl border border-border bg-surface/95 p-5 backdrop-blur-md lg:inset-x-12"
              style={{
                animation: "logo-in 0.8s 0.5s ease-out both",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(215,181,109,0.08)",
              }}
            >
              <div className="grid grid-cols-3 gap-4">
                <Stat value={totalProducts > 0 ? "50+" : "—"} label="منتج" />
                <Stat value="20+" label="ماركة" />
                <Stat value="1000+" label="عميل سعيد" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroTile({
  product,
  height,
}: {
  product: Product | undefined;
  height: string;
}) {
  const media = product?.image as Media | undefined;
  const imageUrl = media?.url || media?.thumbnailURL || "";

  if (!imageUrl) {
    return (
      <div
        className={`${height} overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-2`}
      />
    );
  }

  return (
    <Link
      href={`/${RoutePath.product}/${product!.slug}`}
      className={`group relative block ${height} overflow-hidden rounded-2xl border border-border bg-surface`}
      style={{ transition: "transform 0.4s ease, box-shadow 0.4s ease" }}
    >
      <Image
        src={imageUrl}
        alt={product!.title}
        fill
        sizes="(min-width: 1024px) 260px, 45vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gold md:text-xl">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}