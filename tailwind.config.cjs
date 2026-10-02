module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./templates/**/*.{js,ts,jsx,tsx}",
    "./ParaShop-main/components/**/*.{js,ts,jsx,tsx}",
    "./ParaShop-main/*.{js,ts,jsx,tsx}",
    "./NutritionShop-main/components/**/*.{js,ts,jsx,tsx}",
    "./NutritionShop-main/*.{js,ts,jsx,tsx}",
    "./cosmeticshop-main/components/**/*.{js,ts,jsx,tsx}",
    "./cosmeticshop-main/*.{js,ts,jsx,tsx}",
    "./electro_shop-main/components/**/*.{js,ts,jsx,tsx}",
    "./electro_shop-main/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Lato', 'sans-serif'],
        serif: ['Playfair Display', 'Oswald', 'serif'],
        oswald: ['Oswald', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        lato: ['Lato', 'sans-serif']
      },
      colors: {
        brand: {
          primary: '#008b5e',
          primaryHover: '#00704c',
          secondary: '#84cc16',
          accent: '#f59e0b',
          light: '#f0fdf4',
          dark: '#061a12',
          black: '#050505',
          gray: '#1a1a1a',
          neon: '#ccff00',
          neonHover: '#b3e600',
          alert: '#ef4444',
          slate: '#1e293b',
          bg: '#fcfdfa'
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        gold: {
          100: '#fbf5e6',
          400: '#d4af37',
          500: '#c5a028',
        },
        neon: {
          400: '#ccff00',
          500: '#b3e600'
        }
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(0, 139, 94, 0.1)',
        'xl-brand': '0 20px 40px -15px rgba(0, 139, 94, 0.2)',
      }
    }
  },
  plugins: []
};
