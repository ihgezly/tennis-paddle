"use client";

type Props = {
  mode: "padel" | "tennis";
};

export default function RacketGlow({ mode }: Props) {
  const isPadel = mode === "padel";
  const color = isPadel ? "#29c7ff" : "#ff6338";
  const clipSide = isPadel ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)";

  return (
    <div
      className="relative h-[440px] w-[320px]"
      style={{
        clipPath: clipSide,
        animation: "racket-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 320"
        className="h-full w-full"
        style={{ filter: `drop-shadow(0 0 28px ${color}66)` }}
      >
        <defs>
          <radialGradient
            id={`head-grad-${mode}`}
            cx="50%"
            cy="40%"
            r="60%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Head fill */}
        <path
          d="M100 30 C 145 30, 175 60, 175 115 C 175 170, 145 200, 100 200 C 55 200, 25 170, 25 115 C 25 60, 55 30, 100 30 Z"
          fill={`url(#head-grad-${mode})`}
        />

        {/* Head outline with pulse */}
        <path
          d="M100 30 C 145 30, 175 60, 175 115 C 175 170, 145 200, 100 200 C 55 200, 25 170, 25 115 C 25 60, 55 30, 100 30 Z"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
        />

        {/* Vertical strings */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={40 + i * 20}
            y1="55"
            x2={40 + i * 20}
            y2="180"
            stroke={color}
            strokeOpacity="0.28"
            strokeWidth="0.8"
          />
        ))}

        {/* Horizontal strings */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="40"
            y1={60 + i * 20}
            x2="160"
            y2={60 + i * 20}
            stroke={color}
            strokeOpacity="0.28"
            strokeWidth="0.8"
          />
        ))}

        {/* Throat */}
        <path
          d="M85 205 L85 215 L115 215 L115 205"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Handle */}
        <rect
          x="88"
          y="215"
          width="24"
          height="80"
          rx="6"
          fill={color}
          fillOpacity="0.85"
        />

        {/* Grip lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`g-${i}`}
            x1="88"
            y1={228 + i * 11}
            x2="112"
            y2={228 + i * 11}
            stroke="#05060a"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}