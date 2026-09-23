"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("general");

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-foreground">
          {t("somethingWentWrongTitle")}
        </h2>

        <p className="mt-3 text-sm text-text-secondary">
          {t("somethingWentWrongDescription")}
        </p>

        <Button
          onClick={reset}
          variant="nav"
          className="mt-6 w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          {t("tryAgain")}
        </Button>

        <Link
          href="/"
          className="mt-4 block text-sm text-text-secondary underline underline-offset-4 hover:text-gold"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}