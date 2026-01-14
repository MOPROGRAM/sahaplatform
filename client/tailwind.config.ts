import type { Config } from "tailwindcss";

const config: Config = {
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
          DEFAULT: '#ff6700',
          hover: '#e55c00',
          dark: '#cc5200',
        },
        secondary: {
          DEFAULT: '#111111',
          light: '#444444',
        },
        navy: {
          DEFAULT: '#020617',
          light: '#0f172a',
        },
        emerald: {
          DEFAULT: '#047857',
          light: '#10b981',
        },
        amber: {
          DEFAULT: '#b45309',
          light: '#f59e0b',
        },
        surface: {
          light: '#ffffff',
          dark: '#020617',
        },
        border: {
          light: '#e2e8f0',
          dark: '#1e293b',
        }
      },
      fontSize: {
        'micro': '12px',
        'xs': '14px',
        'sm': '16px',
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '30px',
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'Tajawal', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
