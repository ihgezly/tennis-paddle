import { getTranslations } from "next-intl/server";
import SellEquipmentForm from "@/components/sell/sell-equipment-form";

export default async function SellPage() {
  const t = await getTranslations("sell");
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">{t("title")}</h1>
      <SellEquipmentForm />
    </div>
  );
}