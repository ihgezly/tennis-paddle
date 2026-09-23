import { getTranslations } from "next-intl/server";

import BrandLogo from "@/components/home/brands/brand-logo";

const BRANDS = [
  { name: "Adidas", tagline: "Performance", accent: "#ffffff", glow: "rgba(255,255,255,0.25)" },
  { name: "Nike", tagline: "Just Do It", accent: "#ff7a45", glow: "rgba(255,122,69,0.35)" },
  { name: "Wilson", tagline: "Since 1913", accent: "#e11d48", glow: "rgba(225,29,72,0.35)" },
  { name: "Babolat", tagline: "French Tennis", accent: "#29c7ff", glow: "rgba(41,199,255,0.35)" },
  { name: "Head", tagline: "Play Your Way", accent: "#f5a623", glow: "rgba(245,166,35,0.35)" },
  { name: "Prince", tagline: "Legendary", accent: "#3ecf8e", glow: "rgba(62,207,142,0.35)" },
  { name: "Yonex", tagline: "Japanese Precision", accent: "#d4ff00", glow: "rgba(212,255,0,0.35)" },
  { name: "Bullpadel", tagline: "Padel Pro", accent: "#a855f7", glow: "rgba(168,85,247,0.35)" },
  { name: "Dunlop", tagline: "Since 1888", accent: "#ef4444", glow: "rgba(239,68,68,0.35)" },
];

export default async function BrandsSection() {
  const t = await getTranslations("home.brands");

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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {BRANDS.map((brand) => (
          <BrandLogo
            key={brand.name}
            name={brand.name}
            tagline={brand.tagline}
            accent={brand.accent}
            glow={brand.glow}
          />
        ))}
      </div>
    </section>
  );
}