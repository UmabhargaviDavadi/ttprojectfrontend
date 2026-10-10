/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18332e',
        muted: '#73827d',
        canvas: '#f4f7f4',
        forest: '#176b54',
        mint: '#dff3e8',
        line: '#e7ece8',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 8px 28px rgba(20, 49, 39, 0.06)',
      },
    },
  },
  plugins: [],
}
