import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      height: {
        screen: "100svh",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      colors: {
        primary: "#9747ff",
        dark: {
          // '50': '',
          // '100': '',
          200: "#b3b3b3",
          300: "#808080",
          400: "#404040",
          500: "#303033",
          600: "#262626",
          700: "#212324",
          // '800': '',
          900: "#181a1b",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      transitionProperty: () => ({
        "opacity-colors": `${defaultTheme.transitionProperty.opacity}, ${defaultTheme.transitionProperty.colors}`,
      }),
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
