/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        dental: {
          blue: '#0ea5e9',
          teal: '#14b8a6',
          purple: '#8b5cf6',
        }
      },
    },
  },
  plugins: [],
}