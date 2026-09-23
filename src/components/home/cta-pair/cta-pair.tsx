import { getTranslations } from "next-intl/server";
import { FiPackage, FiTool } from "react-icons/fi";

import AnimatedCtaCard from "@/components/shared/animated-cta-card";
import appConfig from "@/lib/core/config";

export default async function CtaPair() {
  const t = await getTranslations("home.ctaPair");

  const sellUrl = appConfig.SELL_FORM_URL;
  const customUrl = appConfig.CUSTOM_FORM_URL;

  // لو الاتنين مش متظبطين، مانعرضش القسم
  if (!sellUrl && !customUrl) return null;

  return (
    <section className="container py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight uppercase md:text-4xl">
          {t("sectionTitle")}
        </h2>
        <p className="mt-3 text-text-secondary">{t("sectionSubtitle")}</p>
        <div
          className="mx-auto mt-5 h-[2px] w-24 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--volt) 50%, transparent 100%)",
            boxShadow: "0 0 12px var(--volt-glow)",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ── Sell CTA ── */}
        {sellUrl ? (
          <AnimatedCtaCard
            backgroundImage="/images/cta/sell-bg.jpg"
            accent="var(--volt)"
            accent2="var(--shoes-green)"
            glow="var(--volt-glow)"
            icon={<FiPackage size={28} />}
            title={t("sell.title")}
            subtitle={t("sell.subtitle")}
            ctaLabel={t("sell.cta")}
            href={sellUrl}
            align="start"
          />
        ) : null}

        {/* ── Custom Request CTA ── */}
        {customUrl ? (
          <AnimatedCtaCard
            backgroundImage="/images/cta/custom-bg.jpg"
            accent="var(--padel-blue)"
            accent2="var(--tennis-orange)"
            glow="rgba(41, 199, 255, 0.4)"
            icon={<FiTool size={28} />}
            title={t("custom.title")}
            subtitle={t("custom.subtitle")}
            ctaLabel={t("custom.cta")}
            href={customUrl}
            align="end"
          />
        ) : null}
      </div>
    </section>
  );
}