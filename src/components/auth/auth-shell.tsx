"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import "@/lib/styles/auth-split.css";

type AuthShellProps = {
  mode: "login" | "register";
  title?: string;
  subtitle?: string;
};

type AuthResponse = {
  user?: { id: number; email: string; roles?: string[] };
  token?: string;
  errors?: { message: string }[];
  message?: string;
};

const FIELD_CLASS =
  "w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-text-muted transition focus:border-volt focus:outline-none focus:ring-2 focus:ring-volt/15";

export default function AuthShell({ mode }: AuthShellProps) {
  const t = useTranslations("auth");
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(mode === "register");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ═══ حقول النموذج ═══
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ═══ لو المستخدم مسجل بالفعل، يوجه على طول ═══
  useEffect(() => {
    let cancelled = false;

    fetch("/api/users/me?depth=0", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.user) {
          const isAdmin = data.user.roles?.includes("admin");
          window.location.href = isAdmin ? "/admin" : "/";
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingAuth(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ═══ بعد النجاح: reload كامل للتأكد إن الهيدر يتحدث ═══
  const redirectAfterAuth = (roles?: string[]) => {
    const isAdmin = Array.isArray(roles) && roles.includes("admin");
    window.location.href = isAdmin ? "/admin" : "/";
  };

  // ═══ تسجيل الدخول / إنشاء حساب ═══
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/users" : "/api/users/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          isRegister ? { email, password, name } : { email, password },
        ),
      });

      const data: AuthResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.errors?.[0]?.message ||
            data?.message ||
            "فشل التحقق من الحساب",
        );
      }

      toast.success(isRegister ? "تم إنشاء الحساب بنجاح" : "تم تسجيل الدخول");
      redirectAfterAuth(data.user?.roles);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
      setLoading(false);
    }
  };

  // ═══ Google OAuth ═══
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  };

  // ═══ التبديل بين login/register ═══
  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
  };

  // شاشة تحميل صغيرة
  if (checkingAuth) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-volt border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className={`auth-split-container ${isRegister ? "is-active" : ""}`}>
        {/* ═══════════ FORM: LOGIN ═══════════ */}
        <div className="auth-split-form login">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-sm flex-col gap-5"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                {t("loginTitle") || "أهلاً بعودتك"}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {t("loginSubtitle") || "سجّل دخولك لتكمل رحلتك"}
              </p>
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email") || "البريد الإلكتروني"}
              className={FIELD_CLASS}
              autoComplete="email"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password") || "كلمة المرور"}
                className={FIELD_CLASS + " pe-12"}
                autoComplete="current-password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-foreground"
                aria-label={showPassword ? "إخفاء" : "إظهار"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="volt-cta flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold disabled:opacity-50"
            >
              {loading ? "..." : t("loginButton") || "تسجيل الدخول"}
              {!loading && <FiArrowRight size={18} />}
            </button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-surface px-2 text-text-muted">
                  {t("orContinueWith") || "أو"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium transition hover:border-volt/50"
            >
              <FcGoogle size={20} />
              {googleLoading ? "..." : t("loginWithGoogle") || "متابعة بجوجل"}
            </button>
          </form>
        </div>

        {/* ═══════════ FORM: REGISTER ═══════════ */}
        <div className="auth-split-form register">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-sm flex-col gap-5"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                {t("registerTitle") || "أنشئ حسابك"}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {t("registerSubtitle") || "انضم للجيل الجديد من اللاعبين"}
              </p>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fullName") || "الاسم الكامل"}
              className={FIELD_CLASS}
              autoComplete="name"
              required
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email") || "البريد الإلكتروني"}
              className={FIELD_CLASS}
              autoComplete="email"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password") || "كلمة المرور"}
                className={FIELD_CLASS + " pe-12"}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-foreground"
                aria-label={showPassword ? "إخفاء" : "إظهار"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="volt-cta flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold disabled:opacity-50"
            >
              {loading ? "..." : t("createAccount") || "إنشاء الحساب"}
              {!loading && <FiArrowRight size={18} />}
            </button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-surface px-2 text-text-muted">
                  {t("orContinueWith") || "أو"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium transition hover:border-volt/50"
            >
              <FcGoogle size={20} />
              {googleLoading ? "..." : t("loginWithGoogle") || "متابعة بجوجل"}
            </button>
          </form>
        </div>

        {/* ═══════════ TOGGLE OVERLAY ═══════════ */}
        <div className="auth-split-toggle">
          {/* LEFT panel — visible during LOGIN */}
          <div className="auth-split-panel left">
            <div className="auth-racket padel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/auth/padel-racket.png"
                alt="Padel Racket"
                draggable={false}
              />
            </div>

            <h2>أهلاً بك في الملعب</h2>
            <p>ليس لديك حساب؟</p>

            <button
              type="button"
              onClick={() => switchMode(true)}
              className="auth-switch-btn"
            >
              إنشاء حساب
            </button>
          </div>

          {/* RIGHT panel — visible during REGISTER */}
          <div className="auth-split-panel right">
            <div className="auth-racket tennis">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/auth/tennis-racket.png"
                alt="Tennis Racket"
                draggable={false}
              />
            </div>

            <h2>جاهز للانطلاق؟</h2>
            <p>لديك حساب بالفعل؟</p>

            <button
              type="button"
              onClick={() => switchMode(false)}
              className="auth-switch-btn"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}