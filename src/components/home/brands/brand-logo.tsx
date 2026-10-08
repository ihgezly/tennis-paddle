"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/core/util";

type Props = {
  name: string;
  tagline?: string;
  logo?: string;
  href?: string;
  accent: string;
  glow: string;
  className?: string;
};

export default function BrandLogo({ name, tagline, logo, href, accent, glow, className }: Props) {
  const [failed, setFailed] = useState(false);

  const styleVars = { "--brand-accent": accent, "--brand-glow": glow } as React.CSSProperties;

  const content = (
    <div className="brand-logo__content">
      <span className="brand-logo__plate">
        {logo && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={name}
            className="brand-logo__img"
            draggable={false}
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="brand-logo__mono" aria-hidden="true">
            {name.charAt(0)}
          </span>
        )}
      </span>
      <span className="brand-logo__name">{name}</span>
      {tagline ? <span className="brand-logo__tagline">{tagline}</span> : null}
      <span className="brand-logo__line" aria-hidden="true" />
    </div>
  );

  const cls = cn("brand-logo", className);

  return href ? (
    <Link href={href} className={cls} style={styleVars}>
      {content}
    </Link>
  ) : (
    <div className={cls} style={styleVars}>
      {content}
    </div>
  );
}