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
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          dark: 'var(--primary-dark)',
        },
        'gray-bg': 'var(--gray-bg)',
        'card-bg': 'var(--card-bg)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        secondary: {
          DEFAULT: '#1c1e21',
          light: '#2d3142',
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
        }
      },
      fontSize: {
        'micro': '10px',
        'xs': '12px',
        'sm': '13px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
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
