import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function ExploreMore({
  title = "عايز تشوف أكتر؟",
  subtitle = "تصفح كل المنتجات، أوقات بأحدث الإضافات وأفضل الأسعار.",
}: Props) {
  return (
    <section className="container py-20">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-16 text-center md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(215,181,109,0.12) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl space-y-6">
          <div
            className="mx-auto h-[2px] w-16 rounded-full"
            style={{
              backgroundColor: "var(--volt)",
              boxShadow: "0 0 12px var(--volt-glow)",
            }}
          />

          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>

          <p className="text-lg text-text-secondary">{subtitle}</p>

          <div className="pt-2">
            <Link
              href="/categories"
              className="group volt-cta inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 font-semibold"
            >
              اكتشف المزيد
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}