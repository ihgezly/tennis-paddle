import { cn } from "@/lib/core/util";

type FlagCode = "uae" | "china" | "usa";

type Props = {
  code: FlagCode;
  country: string;
  emoji: string;
  accent: string; // hex
  glow: string; // rgba
  className?: string;
};

/* SVG flags — مبسّطة لكن دقيقة */
const FLAGS: Record<FlagCode, React.ReactNode> = {
  uae: (
    <svg
      viewBox="0 0 640 480"
      preserveAspectRatio="xMidYMid slice"
      className="flag-3d__svg"
    >
      <path fill="#00732f" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#000" d="M0 320h640v160H0z" />
      <path fill="#ff0000" d="M0 0h180v480H0z" />
    </svg>
  ),
  china: (
    <svg
      viewBox="0 0 640 480"
      preserveAspectRatio="xMidYMid slice"
      className="flag-3d__svg"
    >
      <defs>
        <path id="cn-star" d="M0-20 .588-6.18l14.56.62L3.9 4.94l3.24 14.28L0 11.8-7.14 19.22l3.24-14.28L-15.148-5.56l14.56-.62z" />
      </defs>
      <path fill="#de2910" d="M0 0h640v480H0z" />
      <use href="#cn-star" transform="translate(120 120) scale(5)" fill="#ffde00" />
      <use href="#cn-star" transform="translate(240 60) scale(1.8)" fill="#ffde00" />
      <use href="#cn-star" transform="translate(300 120) scale(1.8)" fill="#ffde00" />
      <use href="#cn-star" transform="translate(300 200) scale(1.8)" fill="#ffde00" />
      <use href="#cn-star" transform="translate(240 260) scale(1.8)" fill="#ffde00" />
    </svg>
  ),
  usa: (
    <svg
      viewBox="0 0 640 480"
      preserveAspectRatio="xMidYMid slice"
      className="flag-3d__svg"
    >
      <path fill="#fff" d="M0 0h640v480H0z" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <path key={i} fill="#b22234" d={`M0 ${i * 36.92}h640v36.92H0z`} />
      ))}
      <path fill="#3c3b6e" d="M0 0h256v258.46H0z" />
      {Array.from({ length: 50 }).map((_, i) => {
        const row = Math.floor(i / 6);
        const col = i % 6;
        return (
          <circle
            key={i}
            cx={20 + col * 42}
            cy={20 + row * 28}
            r={4}
            fill="#fff"
          />
        );
      })}
    </svg>
  ),
};

export default function Flag3D({
  code,
  country,
  emoji,
  accent,
  glow,
  className,
}: Props) {
  const styleVars = {
    "--flag-accent": accent,
    "--flag-glow": glow,
  } as React.CSSProperties;

  return (
    <div
      className={cn("perspective-container flag-3d", className)}
      style={styleVars}
    >
      <div className="flag-3d__glow" aria-hidden="true" />
      <div className="flag-3d__card">
        {FLAGS[code]}
        <div className="flag-3d__label">
          <span className="flag-3d__country">{country}</span>
          <span className="flag-3d__emoji" aria-hidden="true">
            {emoji}
          </span>
        </div>
      </div>
    </div>
  );
}