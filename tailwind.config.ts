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
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          dark: "var(--gold-dark)",
        },
        grey: {
          DEFAULT: "var(--grey)",
          light: "var(--grey-light)",
          dark: "var(--grey-dark)",
        },
        ivory: "var(--background)",
        maroon: "var(--accent)",
        burgundy: "var(--accent)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-ml)", "Georgia", "Garamond", "serif"],
        sans: ["var(--font-sans)", "var(--font-ml)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        ml: ["var(--font-ml)", "Nirmala UI", "Kartika", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "var(--border-color)",
      },
      backgroundColor: {
        card: "var(--card-bg)",
      },
    },
  },
  plugins: [],
};
export default config;
