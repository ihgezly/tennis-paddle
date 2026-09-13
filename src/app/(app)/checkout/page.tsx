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
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">
          يرجى تسجيل الدخول أولاً
        </h1>
        <p className="text-text-secondary max-w-md">
          عشان تقدر تكمل الطلب، لازم يكون عندك حساب. سجّل دخول أو أنشئ حساب
          جديد في دقيقة.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/login"
            className="rounded-full bg-gold px-8 py-3 font-semibold text-black transition hover:bg-gold/80"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-border px-8 py-3 font-semibold text-foreground transition hover:border-gold"
          >
            إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-[90vh] flex flex-col">
      <h1 className="text-4xl font-semibold text-center">{t("title")}</h1>
      <Checkout />
    </div>
  );
}