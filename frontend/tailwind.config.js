/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0a0e17',
          card: '#111827',
          surface: '#1a2234',
          border: '#2a364f',
          accent: '#3b82f6',
          cyan: '#06b6d4',
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
