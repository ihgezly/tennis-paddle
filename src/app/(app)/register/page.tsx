import AuthShell from "@/components/auth/auth-shell";
import { getTranslations } from "next-intl/server";

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");
  return <AuthShell mode="register" title={t("title")} subtitle={t("subtitle")} />;
}