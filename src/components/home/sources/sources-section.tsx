import { getTranslations } from "next-intl/server";

import Flag3D from "@/components/home/sources/flag-3d";

const SOURCES = [
  { code: "uae" as const, accent: "#d4ff00", glow: "rgba(212, 255, 0, 0.35)", key: "uae" },
  { code: "china" as const, accent: "#ff5c5c", glow: "rgba(255, 92, 92, 0.35)", key: "china" },
  { code: "usa" as const, accent: "#29c7ff", glow: "rgba(41, 199, 255, 0.35)", key: "usa" },
];

export default async function SourcesSection() {
  const t = await getTranslations("home.sources");

  return (
    <section className="container py-20 md:py-24">
      <div className="section-title-wrap">
        <h2 className="section-title">{t("title")}</h2>
        <p className="section-subtitle">{t("subtitle")}</p>
        <div
          className="section-signature"
          style={{ "--section-accent": "var(--volt)", "--section-glow": "var(--volt-glow)" } as React.CSSProperties}
        />
      </div>

      <div className="grid grid-cols-1 place-items-center gap-14 sm:grid-cols-3 sm:gap-8">
        {SOURCES.map((s) => (
          <Flag3D
            key={s.code}
            code={s.code}
            country={t(`items.${s.key}.country`)}
            accent={s.accent}
            glow={s.glow}
          />
        ))}
      </div>
    </section>
  );
}