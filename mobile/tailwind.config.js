/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0C831F',
        'primary-dark': '#0A6D19',
        accent: '#F8CB46',
        'accent-dark': '#E5B800',
        surface: '#FFFFFF',
        background: '#F5F5F5',
        card: '#FFFFFF',
        border: '#E8E8E8',
        muted: '#878787',
        dark: '#1C1C1C',
      },
    },
  },
  plugins: [],
};
