import { cn } from "@/lib/core/util";

const FLAG_FILES = { uae: "ae", china: "cn", usa: "us" } as const;

type Props = {
  code: keyof typeof FLAG_FILES;
  country: string;
  accent: string;
  glow: string;
  className?: string;
};

export default function Flag3D({ code, country, accent, glow, className }: Props) {
  return (
    <div
      className={cn("flag-orb-wrap", className)}
      style={{ "--flag-accent": accent, "--flag-glow": glow } as React.CSSProperties}
    >
      <div className="flag-orb">
        <div className="flag-orb__flag">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/flags/${FLAG_FILES[code]}.png`}
            alt={country}
            className="flag-orb__img"
            draggable={false}
          />
          <span className="flag-orb__waves" />
        </div>
        <span className="flag-orb__shade" />
      </div>
      <span className="flag-orb__floor" aria-hidden="true" />
      <p className="flag-orb__country">{country}</p>
    </div>
  );
}