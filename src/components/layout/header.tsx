"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { HiOutlineUser } from "react-icons/hi";

import type { Media, User, Product } from "@/lib/core/types/payload-types";
import type { PayloadAdminBarProps } from "@payloadcms/admin-bar";

import CartModal from "@/components/cart/cart-modal";
import AccessibilityBar from "@/components/layout/accessibility-bar";
import Search from "@/components/layout/search";
import ImageVideo from "@/components/shared/image-video";
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

const AdminBar = ({ adminBarProps = {} }: { adminBarProps?: PayloadAdminBarProps }) => {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const onAuthChange = useCallback((user: User) => {
    setShow(
      Boolean(
        user && Array.isArray(user.roles) && user.roles.includes("admin")
      )
    );
  }, []);

  return (
    <div
      dir="ltr"
      className={cn(
        "w-full bg-black text-white",
        show ? "block" : "hidden"
      )}
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
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-surface-2 transition"
      aria-label="Toggle theme"
    >
      {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
};

const NAV_ITEMS = [
  { label: "Padel", href: "/categories/padel" },
  { label: "Tennis", href: "/categories/tennis" },
  { label: "Shop", href: "/categories" },
  { label: "Sell", href: "/sell" },
];

type HeaderProps = {
  logo: Media;
  products: Product[];
  adminBarProps?: PayloadAdminBarProps;
};

const HeaderBar = ({ logo, products }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-border"
          : "bg-transparent border-transparent"
      )}
    >
      <nav className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-10">
          <ImageVideo
            resource={logo}
            imgClassName="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium uppercase tracking-wider text-foreground/80 hover:text-gold transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 z-10">
          <div className="hidden md:block w-56">
            <Search products={products} />
          </div>
          <ThemeToggle />
          <Link
            href="/user"
            className="p-2 rounded-full hover:bg-surface-2 transition"
            aria-label="Account"
          >
            <HiOutlineUser size={20} />
          </Link>
          <CartModal />
          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-2 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium uppercase tracking-wider py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2">
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