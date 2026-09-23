import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiArrowLeft } from "react-icons/fi";

import { getSportTheme } from "@/lib/core/util";
import { SportType } from "@/lib/core/types/types";

type Props = {
  sport: SportType | null; // null = aggregate (مثلاً /shoes)
  title: string;
  subtitle?: string;
  productCount: number;
  breadcrumb?: Array<{ label: string; href: string }>;
};

export default async function SportHero({
  sport,
  title,
  subtitle,
  productCount,
  breadcrumb,
}: Props) {
  const t = await getTranslations("sport");
  const theme = getSportTheme(sport);

  return (
    <section
      className="relative overflow-hidden border-b border-border"
      style={{
        background: `linear-gradient(135deg, ${theme.glow} 0%, transparent 60%)`,
      }}
    >
      {/* Animated glow background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${theme.glow} 0%, transparent 55%)`,
        }}
        aria-hidden="true"
      />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${theme.hex} 1px, transparent 1px), linear-gradient(90deg, ${theme.hex} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 py-12 md:py-16">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav
            aria-label="breadcrumb"
            className="mb-4 flex items-center gap-2 text-xs text-text-muted"
          >
            <Link href="/" className="hover:text-volt">
              {t("home")}
            </Link>
            {breadcrumb.map((item, i) => (
              <span key={item.href} className="flex items-center gap-2">
                <FiArrowLeft size={12} />
                {i === breadcrumb.length - 1 ? (
                  <span className="text-foreground">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-volt">
                    {item.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        {/* Title */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              className="text-4xl font-bold tracking-tight uppercase md:text-6xl"
              style={{
                textShadow: `0 0 30px ${theme.glow}`,
              }}
            >
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-3 max-w-2xl text-lg text-text-secondary">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div
            className="rounded-full px-5 py-2 text-sm font-semibold"
            style={{
              backgroundColor: theme.color,
              color: "var(--volt-text)",
              boxShadow: `0 0 24px ${theme.glow}`,
            }}
          >
            {t("productsCount", { count: productCount })}
          </div>
        </div>

        {/* Signature line */}
        <div
          className="mt-8 h-[2px] w-full max-w-md rounded-full"
          style={{
            background: `linear-gradient(90deg, ${theme.hex} 0%, transparent 100%)`,
            boxShadow: `0 0 12px ${theme.glow}`,
          }}
        />
      </div>
    </section>
  );
}