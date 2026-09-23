"use client";

import { FiArrowLeft } from "react-icons/fi";

import "@/lib/styles/animated-cta.css";

type Props = {
  /** Image path تحت /public */
  backgroundImage?: string;
  /** Accent hex (main color) */
  accent: string;
  /** Second color for gradient on icon */
  accent2?: string;
  /** Glow color (rgba) */
  glow: string;
  /** Card background (fallback) */
  bg?: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Title */
  title: string;
  /** Subtitle */
  subtitle: string;
  /** CTA label */
  ctaLabel: string;
  /** External URL (Google Form) */
  href: string;
  /** Optional right-aligned variant (for mirrored layout) */
  align?: "start" | "end";
};

export default function AnimatedCtaCard({
  backgroundImage,
  accent,
  accent2,
  glow,
  bg = "#0c0e12",
  icon,
  title,
  subtitle,
  ctaLabel,
  href,
  align = "start",
}: Props) {
  const styleVars = {
    "--cta-accent": accent,
    "--cta-accent-2": accent2 ?? accent,
    "--cta-glow": glow,
    "--cta-bg": bg,
  } as React.CSSProperties;

  const isEnd = align === "end";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="cta-card"
      style={{
        ...styleVars,
        textAlign: isEnd ? "end" : "start",
      }}
    >
      {/* Animated border */}
      <div className="cta-card__border" aria-hidden="true" />
      <div className="cta-card__border-mask" aria-hidden="true" />

      {/* Background image */}
      {backgroundImage ? (
        <div
          className="cta-card__bg"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        />
      ) : null}

      {/* Gradient overlay */}
      <div
        className="cta-card__overlay"
        style={{
          background: isEnd
            ? `linear-gradient(270deg, ${bg} 0%, ${bg}dd 35%, transparent 100%)`
            : `linear-gradient(90deg, ${bg} 0%, ${bg}dd 35%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className="cta-card__content"
        style={{ alignItems: isEnd ? "flex-end" : "flex-start" }}
      >
        <div
          className="cta-card__icon"
          aria-hidden="true"
        >
          {icon}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 className="cta-card__title">{title}</h3>
          <p className="cta-card__subtitle">{subtitle}</p>
        </div>

        <span className="cta-card__button">
          {ctaLabel}
          <FiArrowLeft size={18} />
        </span>
      </div>

      {/* Bottom shimmer */}
      <div className="cta-card__shimmer" aria-hidden="true" />
    </a>
  );
}