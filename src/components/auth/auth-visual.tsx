"use client";

type Props = {
  mode: "padel" | "tennis";
};

/**
 * ⚠️ مهم: حط الصورتين هنا:
 *   public/images/auth/padel-racket.png
 *   public/images/auth/tennis-racket.png
 *
 * لازم تكون PNG بخلفية شفافة (transparent).
 * الحجم الموصى به: 800x1400 (طولي).
 */
export default function AuthVisual({ mode }: Props) {
  const isPadel = mode === "padel";

  const color = isPadel ? "#29c7ff" : "#ff6338";
  const glow = isPadel
    ? "rgba(41, 199, 255, 0.55)"
    : "rgba(255, 99, 56, 0.55)";

  const imageSrc = isPadel
    ? "/images/auth/padel-racket.png"
    : "/images/auth/tennis-racket.png";

  const positionClass = isPadel
    ? "ltr:-left-[15%] rtl:-right-[15%]"
    : "ltr:-right-[15%] rtl:-left-[15%]";

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${positionClass} flex h-full items-center justify-center`}
      style={{
        width: "70%",
        animation:
          "racket-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 65%)`,
          filter: "blur(48px)",
          animation: "pulse-glow 3.2s ease-in-out infinite",
        }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        className="relative h-[85%] w-auto object-contain"
        style={{
          filter: `drop-shadow(0 0 40px ${glow}) drop-shadow(0 0 12px ${color}88)`,
          transform: isPadel ? "rotate(-8deg)" : "rotate(8deg)",
        }}
        draggable={false}
      />
    </div>
  );
}