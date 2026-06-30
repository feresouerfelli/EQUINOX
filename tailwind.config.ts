import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#ECFDF5", 100: "#D1FAE5", 200: "#A7F3D0",
          300: "#6EE7B7", 400: "#34D399", 500: "#10B981",
          600: "#0A6B4A", 700: "#065F46", 800: "#064E3B",
          900: "#0D2B1E", 950: "#022C22",
        },
        gold: {
          50: "#FDF8E8", 100: "#FAF0C8", 200: "#F5E08C",
          300: "#EFD050", 400: "#E8C024", 500: "#C9A84C",
          600: "#A68B3C", 700: "#83702C", 800: "#60551C",
          900: "#3D3A0C",
        },
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
        arabic: ["Noto Sans Arabic", "Inter", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 300ms ease-out forwards",
        "fade-in": "fadeIn 500ms ease-out forwards",
        shimmer: "shimmer 3s ease-in-out infinite",
        "gold-glow": "goldGlow 2s ease-in-out infinite",
        "bar-grow": "barGrow 800ms ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        goldGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(201, 168, 76, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(201, 168, 76, 0.6)" },
        },
        barGrow: {
          from: { height: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
