import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import { getSportTheme } from "@/lib/core/util";
import { SportType } from "@/lib/core/types/types";

type Props = {
  sport: SportType;
  title: string;
  subtitle?: string;
  href: string;
  count: number;
};

export default function SportCard({
  sport,
  title,
  subtitle,
  href,
  count,
}: Props) {
  const theme = getSportTheme(sport);

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all duration-500 hover:-translate-y-1"
      style={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${theme.glow} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Border glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${theme.hex}`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div
          className="h-12 w-12 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${theme.hex} 0%, ${theme.glow} 100%)`,
            boxShadow: `0 0 24px ${theme.glow}`,
          }}
        />

        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.hex }}
          >
            {count} منتج
          </span>

          <FiArrowLeft
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
            style={{ color: theme.hex }}
          />
        </div>
      </div>
    </Link>
  );
}