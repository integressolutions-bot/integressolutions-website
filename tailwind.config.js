/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#dc2626',   // red
          secondary: '#6b7280', // grey
        },
      },
    },
  },
  plugins: [],
};