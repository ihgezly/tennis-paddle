import { redirect } from "next/navigation";
import Link from "next/link";

import type { Metadata } from "next";

import appConfig from "@/lib/core/config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "بِع معداتك",
  description: "بِع معداتك المستعملة أو الجديدة — املأ الفورم وسنتواصل معك.",
};

export default function SellPage() {
  const formUrl = appConfig.SELL_FORM_URL;

  // ✅ لو الفورم متظبط → redirect مباشر
  if (formUrl) {
    redirect(formUrl);
  }

  // ✅ Fallback — لو الفورم مش متظبط
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-bold md:text-4xl">بِع معداتك</h1>
      <p className="mt-4 max-w-md text-text-secondary">
        خاصية بيع المعدات هتشتغل قريب. تواصل معنا مباشرة عبر واتساب لحد ما
        نطلقها.
      </p>
      {appConfig.CONTACT_PHONE ? (
        <a
          href={`https://wa.me/${appConfig.WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-volt px-8 py-3 font-semibold text-[var(--volt-text)]"
          style={{ boxShadow: "0 0 20px var(--volt-glow)" }}
        >
          تواصل معنا على واتساب
        </a>
      ) : null}
      <Link
        href="/"
        className="mt-6 text-sm text-text-secondary underline underline-offset-4 hover:text-volt"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}