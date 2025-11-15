/** @type {import('tailwindcss').Config} */
const config = {
  content: [],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2FBF8',
          100: '#D2F2E6',
          200: '#A4E4CD',
          300: '#71D1B1',
          400: '#2FB289',
          500: '#00916B',
          600: '#007654',
          700: '#005840',
          800: '#003C2C',
          900: '#01261B'
        }
      },
      boxShadow: {
        glow: '0 15px 50px rgba(0, 17, 16, 0.35)'
      }
    }
  },
  plugins: []
};

module.exports = config;
