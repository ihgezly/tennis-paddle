export default function SignatureLine({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "subtle";
}) {
  return (
    <div
      className={`h-[2px] w-full ${className}`}
      style={{
        background:
          variant === "full"
            ? "linear-gradient(90deg, transparent 0%, var(--volt) 50%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, var(--volt) 50%, transparent 100%)",
        opacity: variant === "full" ? 0.9 : 0.5,
        boxShadow: "0 0 12px var(--volt-glow)",
      }}
      aria-hidden="true"
    />
  );
}