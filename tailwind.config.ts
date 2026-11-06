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
          bg: "#000921",
          surface: "#0B1120",
          card: "#0D1527",
          cardHover: "#111C35",
          border: "#1E293B",
          primary: "#1677FF",
          primaryHover: "#4096FF",
          primaryGlow: "rgba(22, 119, 255, 0.18)",
          success: "#22C55E",
          successGlow: "rgba(34, 197, 94, 0.16)",
          warning: "#F59E0B",
          muted: "#94A3B8",
          subtle: "#64748B",
          text: "#FFFFFF"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"]
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
