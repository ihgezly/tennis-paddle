"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import type { Media, User, Product } from "@/lib/core/types/payload-types";
import type { PayloadAdminBarProps } from "@payloadcms/admin-bar";

import CartModal from "@/components/cart/cart-modal";
import AccessibilityBar from "@/components/layout/accessibility-bar";
import Search from "@/components/layout/search";
import ImageVideo from "@/components/shared/image-video";
import SignatureLine from "@/components/shared/signature-line";
import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/util";
import { useTheme } from "@/lib/providers/theme";

const LivePreviewListener = () => {
  const router = useRouter();
  return (
    <RefreshRouteOnSave
      refresh={router.refresh}
      serverURL={appConfig.BASE_URL}
    />
  );
};

const AdminBar = ({
  adminBarProps = {},
}: {
  adminBarProps?: PayloadAdminBarProps;
}) => {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const onAuthChange = useCallback((user: User) => {
    setShow(
      Boolean(
        user && Array.isArray(user.roles) && user.roles.includes("admin"),
      ),
    );
  }, []);

  return (
    <div
      dir="ltr"
      className={cn("w-full bg-black text-white", show ? "block" : "hidden")}
    >
      <PayloadAdminBar
        {...adminBarProps}
        className="container py-2 text-white"
        cmsURL={appConfig.SERVER_URL}
        logo={<span>Dashboard</span>}
        onAuthChange={onAuthChange as any}
        onPreviewExit={() => {
          fetch(`${appConfig.SERVER_URL}/preview/exit`).then(() => {
            router.push("/");
            router.refresh();
          });
        }}
      />
    </div>
  );
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full p-2 text-foreground transition hover:bg-surface-2"
      aria-label="تبديل الوضع"
    >
      {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
};

const NAV_ITEMS = [
  { label: "بادل", href: "/category/padel", sport: "padel" as const },
  { label: "تنس", href: "/category/tennis", sport: "tennis" as const },
  { label: "المتجر", href: "/categories", sport: "general" as const },
  { label: "بِع معداتك", href: "/sell", sport: "general" as const },
];

type HeaderProps = {
  logo?: Media;
  products: Product[];
  user?: User | null;
  adminBarProps?: PayloadAdminBarProps;
};

const HeaderBar = ({ logo, products }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ═══ حالة المستخدم — بتتحدث من الـclient ═══
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const pathname = usePathname();

  // كل مرة الـroute يتغير، نعيد جلب المستخدم
  useEffect(() => {
    let cancelled = false;

    fetch("/api/users/me?depth=0", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setUser(data?.user ?? null);
        setUserLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setUserLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = user?.roles?.includes("admin");
  const isLoggedIn = Boolean(user);

  const logoUrl = (logo as Media)?.url;

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    window.location.href = "/";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isScrolled
          ? "border-b border-border bg-background/90 backdrop-blur-xl"
          : "bg-background/70 backdrop-blur-md",
      )}
    >
      <SignatureLine />

      <nav className="container flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            <ImageVideo
              resource={logo as Media}
              imgClassName="h-10 w-auto object-contain"
            />
          ) : (
            <span className="text-lg font-bold tracking-tight">
              Padel<span className="text-volt">.</span>
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-sport={item.sport}
              className="sport-nav-link py-2 text-sm font-medium text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden w-56 md:block">
            <Search products={products} />
          </div>

          <ThemeToggle />

          {/* ═══ حالة المستخدم — بتتحدث لايف ═══ */}
          {!userLoaded ? (
            <div className="hidden h-8 w-20 animate-pulse rounded-full bg-surface-2 md:block" />
          ) : isAdmin ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/admin"
                className="rounded-full border border-volt/40 bg-volt/10 px-4 py-2 text-xs font-semibold text-volt transition hover:bg-volt/20"
              >
                لوحة التحكم
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-2 text-foreground/70 transition hover:text-red-500"
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <FiLogOut className="h-4 w-4" />
              </button>
            </div>
          ) : isLoggedIn ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:border-volt hover:text-volt"
              >
                <FiUser className="h-3.5 w-3.5" />
                حسابي
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-2 text-foreground/70 transition hover:text-red-500"
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <FiLogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-volt px-5 py-2 text-xs font-semibold text-[var(--volt-text)] transition hover:opacity-90 md:inline-block"
              style={{ boxShadow: "0 0 18px var(--volt-glow)" }}
            >
              تسجيل الدخول
            </Link>
          )}

          <CartModal />

          <button
            type="button"
            className="rounded-full p-2 text-foreground transition hover:bg-surface-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-3 py-5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-sport={item.sport}
                className="sport-nav-link w-fit py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-border pt-4">
              {isAdmin ? (
                <div className="flex gap-2">
                  <Link
                    href="/admin"
                    className="flex-1 rounded-full bg-volt px-5 py-2.5 text-center text-sm font-semibold text-[var(--volt-text)]"
                  >
                    لوحة التحكم
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-border px-4 py-2.5 text-sm text-red-500"
                  >
                    خروج
                  </button>
                </div>
              ) : isLoggedIn ? (
                <div className="flex gap-2">
                  <Link
                    href="/account/orders"
                    className="flex-1 rounded-full border border-border px-5 py-2.5 text-center text-sm"
                  >
                    حسابي
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-border px-4 py-2.5 text-sm text-red-500"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full rounded-full bg-volt px-5 py-2.5 text-center text-sm font-semibold text-[var(--volt-text)]"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>

            <div className="mt-1">
              <Search products={products} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default function HeaderClient({ adminBarProps, ...props }: HeaderProps) {
  return (
    <>
      <AdminBar adminBarProps={adminBarProps} />
      <LivePreviewListener />
      <HeaderBar {...props} />
      <AccessibilityBar />
    </>
  );
}