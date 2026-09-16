import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiArrowRight } from "react-icons/fi";

export default async function FinalCta() {
  const t = await getTranslations("home.finalCta");

  return (
    <section className="container py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-12 text-center md:p-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--volt-glow) 0%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl space-y-6">
          <div
            className="mx-auto h-[2px] w-16 rounded-full"
            style={{
              backgroundColor: "var(--volt)",
              boxShadow: "0 0 12px var(--volt-glow)",
            }}
          />

          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-5xl">
            {t("title")}
          </h2>

          <p className="text-lg text-text-secondary">{t("subtitle")}</p>

          <div className="pt-4">
            <Link
              href="/sell"
              className="group volt-cta inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 font-semibold"
            >
              {t("button")}
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}