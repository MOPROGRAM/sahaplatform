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
          DEFAULT: '#ff6700', // Typical Chinese marketplace orange
          dark: '#e55c00',
        },
        secondary: {
          DEFAULT: '#222222',
          light: '#666666',
        },
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
        },
        emerald: {
          DEFAULT: '#059669',
          light: '#10b981',
        },
        amber: {
          DEFAULT: '#d97706',
          light: '#f59e0b',
        },
        surface: {
          light: '#ffffff',
          dark: '#0f111a',
        },
        border: {
          light: '#e5e7eb',
          dark: '#1f2937',
        }
      },
      fontSize: {
        'micro': '12px',
        'xs': '13px',
        'sm': '15px',
        'base': '17px',
        'lg': '19px',
        'xl': '22px',
        '2xl': '26px',
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
