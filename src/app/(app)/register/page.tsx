import AuthShell from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export const metadata = { title: "إنشاء حساب" };

export default function RegisterPage() {
  return <AuthShell mode="register" />;
}