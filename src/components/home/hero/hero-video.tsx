export default function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060a] via-[#0a0d12]/95 to-[#05060a]" />

      {/* Radial gold glow at center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(215, 181, 109, 0.08) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Corner glows: padel (top-left) + tennis (bottom-right) */}
      <div
        className="absolute -start-32 -top-32 h-96 w-96 rounded-full opacity-[0.06] blur-3xl"
        style={{ backgroundColor: "var(--padel-blue)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -end-32 h-96 w-96 rounded-full opacity-[0.06] blur-3xl"
        style={{ backgroundColor: "var(--tennis-orange)" }}
        aria-hidden="true"
      />

      {/* Video layer (لما يتوفر) */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/images/hero/poster.webp"
        aria-hidden="true"
      >
        <source src="/video/hero-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}