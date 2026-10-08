import { getTranslations } from "next-intl/server";

import BrandLogo from "@/components/home/brands/brand-logo";

// حط اللوجو في public/images/brands/<slug>.svg (أو .png وغيّر الامتداد هنا)
const BRANDS = [
  { name: "Adidas", slug: "adidas", tagline: "Performance", accent: "#111111", glow: "rgba(120,120,120,0.35)" },
  { name: "Nike", slug: "nike", tagline: "Just Do It", accent: "#ff7a45", glow: "rgba(255,122,69,0.35)" },
  { name: "Wilson", slug: "wilson", tagline: "Since 1913", accent: "#e11d48", glow: "rgba(225,29,72,0.35)" },
  { name: "Babolat", slug: "babolat", tagline: "French Tennis", accent: "#29c7ff", glow: "rgba(41,199,255,0.35)" },
  { name: "Head", slug: "head", tagline: "Play Your Way", accent: "#f5a623", glow: "rgba(245,166,35,0.35)" },
  { name: "Prince", slug: "prince", tagline: "Legendary", accent: "#3ecf8e", glow: "rgba(62,207,142,0.35)" },
  { name: "Yonex", slug: "yonex", tagline: "Japanese Precision", accent: "#7aa800", glow: "rgba(212,255,0,0.4)" },
  { name: "Bullpadel", slug: "bullpadel", tagline: "Padel Pro", accent: "#a855f7", glow: "rgba(168,85,247,0.35)" },
  { name: "Dunlop", slug: "dunlop", tagline: "Since 1888", accent: "#ef4444", glow: "rgba(239,68,68,0.35)" },
];

export default async function BrandsSection() {
  const t = await getTranslations("home.brands");

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

      <div className="brands-grid">
        {BRANDS.map((b) => (
          <BrandLogo
            key={b.slug}
            name={b.name}
            tagline={b.tagline}
            logo={`/images/brands/${b.slug}.svg`}
            accent={b.accent}
            glow={b.glow}
          />
        ))}
      </div>
    </section>
  );
}