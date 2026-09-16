import AuthShell from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export const metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return <AuthShell mode="login" />;
}