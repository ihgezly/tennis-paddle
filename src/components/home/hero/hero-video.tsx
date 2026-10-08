import Image from "next/image";

import type { Media } from "@/lib/core/types/payload-types";

/**
 * خلفية الهيرو: full-bleed، بتتبع الـtokens (نهاري/ليلي)،
 * وبتقبل صورة تختارها من SiteSettings.home.heroBackground.
 */
export default function HeroVideo({ image }: { image?: Media | null }) {
  const src = image?.url;

  return (
    <div className="hero-bg" aria-hidden="true">
      {src ? (
        <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
      ) : null}

      <div className={src ? "hero-bg__veil hero-bg__veil--photo" : "hero-bg__veil"} />

      {/* خطوط ملعب — بصمة الموقع */}
      <svg
        className="hero-bg__court"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="120" y="50" width="760" height="500" />
        <rect x="190" y="50" width="620" height="500" />
        <line x1="190" y1="190" x2="810" y2="190" />
        <line x1="190" y1="410" x2="810" y2="410" />
        <line x1="500" y1="190" x2="500" y2="410" />
        <line x1="100" y1="300" x2="900" y2="300" strokeDasharray="6 8" />
      </svg>

      <div className="hero-bg__glow" />

      <video
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/images/hero/poster.webp"
      >
        <source src="/video/hero-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}