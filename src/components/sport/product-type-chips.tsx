"use client";

import Link from "next/link";

import type { ProductType } from "@/lib/core/types/types";

import { getSportTheme } from "@/lib/core/util";

type Props = {
  productTypes: ProductType[];
  basePath: string;
  currentTypeSlug?: string;
  sportType?: string | null;
};

export default function ProductTypeChips({
  productTypes,
  basePath,
  currentTypeSlug,
  sportType,
}: Props) {
  if (!productTypes.length) return null;

  const theme = getSportTheme(sportType);

  return (
    <div className="border-b border-border bg-surface/60 backdrop-blur">
      <div className="container flex gap-3 overflow-x-auto py-4 no-scrollbar">
        <Chip
          href={basePath}
          label="الكل"
          active={!currentTypeSlug}
          accent={theme.hex}
          glow={theme.glow}
        />

        {productTypes.map((pt) => {
          // ✅ type-safe icon extraction
          let iconUrl: string | undefined = undefined;
          const icon = pt.icon as unknown;

          if (
            icon &&
            typeof icon === "object" &&
            "url" in icon &&
            typeof (icon as { url?: unknown }).url === "string"
          ) {
            iconUrl = (icon as { url: string }).url;
          }

          return (
            <Chip
              key={pt.id}
              href={`${basePath}/${pt.slug}`}
              label={pt.title}
              active={currentTypeSlug === pt.slug}
              accent={theme.hex}
              glow={theme.glow}
              icon={iconUrl}
            />
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  href,
  label,
  active,
  accent,
  glow,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  accent: string;
  glow: string;
  icon?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300"
      style={{
        borderColor: active ? accent : "var(--border)",
        backgroundColor: active ? accent : "var(--surface-2)",
        color: active ? "var(--volt-text)" : "var(--foreground)",
        boxShadow: active ? `0 0 20px ${glow}` : "none",
      }}
    >
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" className="h-4 w-4 object-contain" />
      ) : (
        <span
          className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
          style={{
            backgroundColor: active ? "var(--volt-text)" : accent,
            boxShadow: active ? "none" : `0 0 6px ${glow}`,
          }}
        />
      )}
      <span>{label}</span>
    </Link>
  );
}