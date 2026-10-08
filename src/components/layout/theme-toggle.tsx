"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

import { cn } from "@/lib/core/util";
import { useTheme } from "@/lib/providers/theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      dir="ltr"
      role="switch"
      aria-checked={isDark}
      aria-label="تبديل الوضع"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("theme-toggle", isDark && "theme-toggle--dark")}
    >
      <span className="theme-toggle__stars" aria-hidden="true" />
      <span className="theme-toggle__thumb">
        <FiSun size={16} className="theme-toggle__icon theme-toggle__sun" />
        <FiMoon size={15} className="theme-toggle__icon theme-toggle__moon" />
      </span>
    </button>
  );
}