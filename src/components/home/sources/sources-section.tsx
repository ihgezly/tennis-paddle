import { getTranslations } from "next-intl/server";

import Flag3D from "@/components/home/sources/flag-3d";

const SOURCES = [
  {
    code: "uae" as const,
    country: "الإمارات",
    emoji: "🇦🇪",
    accent: "#d4ff00",
    glow: "rgba(212, 255, 0, 0.35)",
    translationKey: "uae",
  },
  {
    code: "china" as const,
    country: "الصين",
    emoji: "🇨🇳",
    accent: "#ff5c5c",
    glow: "rgba(255, 92, 92, 0.35)",
    translationKey: "china",
  },
  {
    code: "usa" as const,
    country: "أمريكا",
    emoji: "🇺🇸",
    accent: "#29c7ff",
    glow: "rgba(41, 199, 255, 0.35)",
    translationKey: "usa",
  },
];

export default async function SourcesSection() {
  const t = await getTranslations("home.sources");

  return (
    <section className="container py-24">
      <div className="section-title-wrap">
        <h2 className="section-title">{t("title")}</h2>
        <p className="section-subtitle">{t("subtitle")}</p>
        <div
          className="section-signature"
          style={
            {
              "--section-accent": "var(--volt)",
              "--section-glow": "var(--volt-glow)",
            } as React.CSSProperties
          }
        />
      </div>

      <div className="perspective-container grid grid-cols-1 gap-8 sm:grid-cols-3">
        {SOURCES.map((src) => (
          <Flag3D
            key={src.code}
            code={src.code}
            country={t(`items.${src.translationKey}.country`)}
            emoji={src.emoji}
            accent={src.accent}
            glow={src.glow}
          />
        ))}
      </div>
    </section>
  );
}