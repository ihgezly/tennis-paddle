"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type AuthShellProps = {
  mode: "login" | "register";
  title: string;
  subtitle: string;
};

export default function AuthShell({ mode, title, subtitle }: AuthShellProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPadel = !isRegister;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/users" : "/api/users/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? { email, password, name } : { email, password }
        ),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Authentication failed");
      }

      toast.success(isRegister ? "Account created" : "Login successful");
      router.push("/user");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const next = !isRegister;
    setIsRegister(next);
    router.push(next ? "/register" : "/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* النموذج */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="mb-6 flex justify-center">
              <div className="inline-flex rounded-full border border-border p-1 bg-surface-2">
                <button
                  onClick={() => router.push("/login")}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                    !isRegister ? "bg-gold text-black" : "text-text-secondary"
                  }`}
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                    isRegister ? "bg-gold text-black" : "text-text-secondary"
                  }`}
                >
                  {t("register")}
                </button>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-text-secondary">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder={t("fullName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-foreground placeholder:text-text-muted focus:border-gold focus:outline-none"
                required
              />
            )}
            <input
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-foreground placeholder:text-text-muted focus:border-gold focus:outline-none"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 pr-12 text-foreground placeholder:text-text-muted focus:border-gold focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold transition ${
                isPadel
                  ? "bg-padel-blue text-black hover:bg-padel-blue/80"
                  : "bg-tennis-orange text-white hover:bg-tennis-orange/80"
              } disabled:opacity-50`}
            >
              {loading
                ? "..."
                : isRegister
                ? t("createAccount")
                : t("loginButton")}
              {!loading && <FiArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            {isRegister ? t("alreadyHaveAccount") : t("needAccount")}{" "}
            <button onClick={toggleMode} className="text-gold hover:underline">
              {isRegister ? t("login") : t("register")}
            </button>
          </p>
        </div>
      </div>

      {/* الجانب البصري */}
      <div
        className={`hidden lg:flex flex-1 items-center justify-center transition-colors duration-700 ${
          isPadel ? "bg-[#07111F]" : "bg-[#17070A]"
        }`}
      >
        <div className="text-center">
          <div
            className={`mx-auto h-64 w-16 rounded-full border-2 transition-all duration-700 ${
              isPadel
                ? "border-padel-blue shadow-[0_0_60px_rgba(41,199,255,0.4)]"
                : "border-tennis-orange shadow-[0_0_60px_rgba(255,99,56,0.4)]"
            }`}
          />
          <p className="mt-6 font-mono text-sm uppercase tracking-widest text-white/70">
            {isPadel ? "Padel Edition" : "Tennis Edition"}
          </p>
        </div>
      </div>
    </div>
  );
}