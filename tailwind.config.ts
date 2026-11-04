import type { Config } from "tailwindcss";
import { themeTokens } from "./src/config/theme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-brand": themeTokens.gradients.brand,
        "gradient-accent": themeTokens.gradients.accent,
        "gradient-accent-hover": themeTokens.gradients.accentHover,
        "gradient-champagne": themeTokens.gradients.champagne,
        "gradient-dark-card": themeTokens.gradients.darkCardHighlight,
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        champagne: themeTokens.colors.champagne,
        dark: themeTokens.colors.dark,
        navy: {
          50: "#f0f3f9",
          100: "#d9e2f1",
          200: "#b4c6e4",
          300: "#86a2d3",
          400: "#597dc0",
          500: "#3d61a8",
          600: "#2f4d8b",
          700: "#273e70",
          800: "#1e2f55",
          900: "#0F172A", // Brand navy gelap
          950: "#0B1020", // Mode gelap latar
        },
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#7C6CF0", // Brand violet lembut
          600: "#6D5BE8", // Accent start
          700: "#5B4BDB", // Brand indigo
          800: "#4532a4",
          900: "#272560", // Brand mid
          950: "#111833", // Dark surface
        },
        ivory: {
          50: "#FFFFFF",
          100: "#FAF9F6", // Brand ivory white
          200: "#F4F1EA",
          300: "#EAE5DB",
          400: "#DCD5C7",
          500: "#C7BDB0",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      boxShadow: {
        "glow-violet": "0 0 20px -3px rgba(109, 91, 232, 0.35)",
        "glow-sm": "0 0 10px -2px rgba(109, 91, 232, 0.25)",
        "glow-champagne": "0 0 12px -2px rgba(201, 169, 110, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
