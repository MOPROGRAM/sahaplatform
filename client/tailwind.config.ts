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
          DEFAULT: '#ff6700', // Typical Chinese marketplace orange (like Taobao/Xiaomi)
          dark: '#e55c00',
        },
        secondary: {
          DEFAULT: '#222222',
          light: '#666666',
        },
        surface: {
          light: '#ffffff',
          dark: '#0f111a', // Dark mode background
        },
        border: {
          light: '#e5e7eb',
          dark: '#1f2937',
        }
      },
      fontSize: {
        'micro': '10px',
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'Tajawal', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
