import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function FinalCta() {
  const t = await getTranslations("home.finalCta");

  return (
    <section className="container py-16">
      <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-surface p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,181,109,0.15),transparent)]" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            {t("subtitle")}
          </p>
          <Link
            href="/sell"
            className="mt-8 inline-block rounded-full bg-gold px-8 py-4 font-semibold text-black transition hover:bg-gold/80"
          >
            {t("button")}
          </Link>
        </div>
      </div>
    </section>
  );
}