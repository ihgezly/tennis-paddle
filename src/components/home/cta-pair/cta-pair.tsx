import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";

type Card = {
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string;
  accent: string;
  glow: string;
  fallback: string;
};

function CtaLink({ href, className, style, children }: {
  href: string; className: string; style: React.CSSProperties; children: React.ReactNode;
}) {
  const external = /^https?:\/\//.test(href);
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

export default async function CtaPair() {
  const settings: any = await DAL.querySiteSettings().catch(() => null);
  const wa = settings?.footer?.social?.whatsappNumber;

  // لو اللينكات في .env فاضية → fallback بدل ما القسم يختفي
  const sellUrl = appConfig.SELL_FORM_URL || "/sell";
  const customUrl =
    appConfig.CUSTOM_FORM_URL ||
    (wa
      ? `https://wa.me/${wa}?text=${encodeURIComponent("عايز أطلب منتج معيّن")}`
      : "/categories");

  const cards: Card[] = [
    {
      title: "عندك معدات مش بتستخدمها؟",
      text: "ابعت صور المضرب أو الحذاء، وهنقيّمه ونرجعلك بعرض سعر.",
      cta: "بِع معداتك",
      href: sellUrl,
      image: "/images/cta/sell.webp",
      accent: "var(--volt)",
      glow: "var(--volt-glow)",
      fallback: "linear-gradient(135deg, #1b2d2a 0%, #0c0e12 70%)",
    },
    {
      title: "مش لاقي اللي بتدور عليه؟",
      text: "قولنا الماركة والموديل والمقاس، وهنجيبه لك من الإمارات أو الصين أو أمريكا.",
      cta: "اطلب منتجك",
      href: customUrl,
      image: "/images/cta/custom.webp",
      accent: "var(--padel-blue)",
      glow: "var(--padel-blue-glow)",
      fallback: "linear-gradient(135deg, #0b2a36 0%, #0c0e12 70%)",
    },
  ];

  return (
    <section className="container py-16 md:py-20">
      <div className="cta-grid">
        {cards.map((c) => (
          <CtaLink
            key={c.cta}
            href={c.href}
            className="cta-card"
            style={
              {
                "--cta-img": `url(${c.image})`,
                "--cta-fallback": c.fallback,
                "--cta-accent": c.accent,
                "--cta-glow": c.glow,
              } as React.CSSProperties
            }
          >
            <h3 className="cta-card__title">{c.title}</h3>
            <p className="cta-card__text">{c.text}</p>
            <span className="cta-card__btn">
              {c.cta}
              <FiArrowRight size={16} />
            </span>
          </CtaLink>
        ))}
      </div>
    </section>
  );
}