import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HeroVideo from "./hero-video";

export default async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-black text-white">
      <HeroVideo />

      <div className="relative z-10 text-center px-4">
        <h1 className="mt-4 text-6xl md:text-8xl font-bold tracking-tight uppercase fade-in">
          {t("title")}
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto slide-up">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/categories"
            className="rounded-full bg-white px-8 py-4 font-semibold text-black hover:bg-gray-200 transition"
          >
            {t("shopNow")}
          </Link>
          <Link
            href="/sell"
            className="rounded-full border border-white/30 px-8 py-4 font-semibold text-white hover:bg-white/10 transition"
          >
            {t("sellEquipment")}
          </Link>
        </div>
      </div>
    </section>
  );
}