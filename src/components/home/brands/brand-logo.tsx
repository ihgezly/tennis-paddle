import Link from "next/link";

import { cn } from "@/lib/core/util";

type Props = {
  name: string;
  tagline?: string;
  href?: string;
  accent: string; // hex
  glow: string; // rgba
  fontStyle?: "sans" | "serif" | "mono";
  className?: string;
};

export default function BrandLogo({
  name,
  tagline,
  href,
  accent,
  glow,
  fontStyle = "sans",
  className,
}: Props) {
  const styleVars = {
    "--brand-accent": accent,
    "--brand-glow": glow,
    "--brand-font":
      fontStyle === "serif"
        ? "Georgia, serif"
        : fontStyle === "mono"
          ? "var(--font-mono)"
          : "inherit",
  } as React.CSSProperties;

  const content = (
    <div className="brand-logo__content">
      <span className="brand-logo__name">{name}</span>
      {tagline ? <span className="brand-logo__tagline">{tagline}</span> : null}
      <span className="brand-logo__line" aria-hidden="true" />
    </div>
  );

  const className_ = cn("brand-logo", className);

  if (href) {
    return (
      <Link href={href} className={className_} style={styleVars}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className_} style={styleVars}>
      {content}
    </div>
  );
}