import { getTranslations } from "next-intl/server";

import SellEquipmentForm from "@/components/sell/sell-equipment-form";

export default async function SellPage() {
  const t = await getTranslations("sell");

  return (
    <div className="container py-20">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {t("title") || "بِع معداتك"}
        </h1>
        <div
          className="mx-auto mt-5 h-[2px] w-20 rounded-full"
          style={{
            backgroundColor: "var(--volt)",
            boxShadow: "0 0 12px var(--volt-glow)",
          }}
        />
        <p className="mx-auto mt-5 max-w-xl text-text-secondary">
          بيع معداتك الأصلية بسهولة — املأ النموذج وسنتواصل معاك خلال 24 ساعة.
        </p>
      </div>

      <SellEquipmentForm />
    </div>
  );
}