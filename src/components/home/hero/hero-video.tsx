import { getTranslations } from "next-intl/server";

export default async function HeroVideo() {
  const t = await getTranslations("hero");

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Placeholder بصري أنيق */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="mx-auto h-0.5 w-24 bg-gold" />
          <p className="font-mono text-sm tracking-[0.4em] text-gold uppercase">
            {t("tagline")}
          </p>
        </div>
      </div>

      {/* الفيديو الفعلي (يُضاف لاحقًا) */}
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