import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#0E1227",
          50: "#1E2548",
          100: "#171D3B",
          200: "#131832",
          300: "#0E1227",
          400: "#0A0D1D",
          500: "#060813",
        },
        eco: {
          green: "#22C55E",
          emerald: "#10B981",
          teal: "#2DD4BF",
          blue: "#2563EB",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(16, 185, 129, 0.25)",
        "glow-teal": "0 0 25px -5px rgba(45, 212, 191, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
