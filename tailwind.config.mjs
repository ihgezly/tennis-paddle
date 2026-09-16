import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-elevated": "var(--surface-elevated)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",

        /* Brand */
        volt: "var(--volt)",
        "volt-text": "var(--volt-text)",

        /* Legacy alias (نشيله لاحقًا) */
        gold: "var(--volt)",
        "gold-soft": "var(--gold-soft)",

        /* Sport identities */
        "padel-blue": "var(--padel-blue)",
        "tennis-orange": "var(--tennis-orange)",
        "shoes-green": "var(--shoes-green)",
        "cyan-glow": "var(--cyan-glow)",

        /* Text */
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",

        /* Status */
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
      },
      fontFamily: {
        sans: ["Cairo", "IBM Plex Sans Arabic", "Inter", "system-ui", "sans-serif"],
        mono: ["Space Grotesk", "JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Cairo", "IBM Plex Sans Arabic", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "86rem",
      },
      boxShadow: {
        volt: "0 0 24px var(--volt-glow)",
        "volt-lg": "0 10px 40px var(--volt-glow)",
        "volt-sm": "0 0 18px var(--volt-glow)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        logoIn: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        voltPulse: {
          "0%, 100%": { boxShadow: "0 0 20px var(--volt-glow)" },
          "50%": { boxShadow: "0 0 40px var(--volt-glow)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 1s ease-out forwards",
        "logo-in": "logoIn 0.8s ease-out",
        "volt-pulse": "voltPulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
};