/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        card: '#E8DCC4',
        accent: '#C19A6B',
        'accent-dark': '#A98457',
        text: '#4A4A4A',
        'text-light': '#6B6B6B',
        primary: '#8B5E3C',
        success: '#22c55e',
        warning: '#f97316',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'lifted': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'top': '0 -4px 12px rgba(0, 0, 0, 0.05)',
      }
    }
  },
  plugins: [],
}