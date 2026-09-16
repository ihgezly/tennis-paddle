import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";

import type { Metadata } from "next";

import { Checkout } from "@/components/shared/wrappers";
import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout.page");
  return { title: t("title") };
}

export default async function CheckoutPage() {
  const t = await getTranslations("checkout.page");
  const headersList = await headers();
  const fakeReq = new Request("http://local", { headers: headersList });
  const user = await DAL.queryCurrentUser(fakeReq);

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40"
          style={{ boxShadow: "0 0 24px rgba(215, 181, 109, 0.35)" }}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-gold" fill="none">
            <path
              d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2ZM8 9V7a4 4 0 1 1 8 0v2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold md:text-4xl">
          يرجى تسجيل الدخول أولاً
        </h1>

        <p className="max-w-md text-text-secondary">
          عشان تقدر تكمل الطلب، لازم يكون عندك حساب. سجّل دخول أو أنشئ حساب
          جديد في دقيقة.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-gold px-8 py-3 font-semibold text-black transition hover:opacity-90"
            style={{ boxShadow: "0 0 20px rgba(215, 181, 109, 0.3)" }}
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-border px-8 py-3 font-semibold text-foreground transition hover:border-gold hover:text-gold"
          >
            إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[90vh] flex-col">
      <h1 className="text-center text-4xl font-semibold">{t("title")}</h1>
      <Checkout />
    </div>
  );
}