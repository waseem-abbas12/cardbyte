import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "var(--brand-bg)",
          surface: "var(--brand-surface)",
          card: "var(--brand-card)",
          cardHover: "var(--brand-card-hover)",
          border: "var(--brand-border)",
          primary: "var(--brand-primary, #0062FF)",
          primaryHover: "var(--brand-primary-hover, #004ecc)",
          primaryGlow: "var(--brand-primary-glow)",
          accent: "var(--brand-accent, #00D2D3)",
          accentHover: "var(--brand-accent-hover, #00b4b5)",
          success: "#10b981",
          successGlow: "var(--brand-success-glow)",
          warning: "#f59e0b",
          coral: "#ff6b4a",
          muted: "var(--brand-muted)",
          subtle: "var(--brand-subtle)",
          text: "var(--brand-text)"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"]
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        cardHover: "0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)"
      },
      animation: {
        "ticker": "ticker 35s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" }
        }
      }
    },
  },
  plugins: [],
};

export default config;
