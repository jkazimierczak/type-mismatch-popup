import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
    },
  },
  plugins: [],
} satisfies Config;
