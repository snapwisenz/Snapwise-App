import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8e3e9d',
          50: '#fcf8fd',
          100: '#f5eef7',
          200: '#ead9ed',
          300: '#dab8df',
          400: '#c58dce',
          500: '#b061bc',
          600: '#8e3e9d', // Base
          700: '#763182',
          800: '#61296a',
          900: '#512457',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
