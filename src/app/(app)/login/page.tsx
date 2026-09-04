import AuthShell from "@/components/auth/auth-shell";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return <AuthShell mode="login" title={t("title")} subtitle={t("subtitle")} />;
}