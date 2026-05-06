import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8806bc',
          50: '#f6effa',
          100: '#eadbfa',
          200: '#d7bcfa',
          300: '#c092f6',
          400: '#a760f0',
          500: '#9438e8',
          600: '#8806bc', // Base
          700: '#7513a8',
          800: '#64158b',
          900: '#531370',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
