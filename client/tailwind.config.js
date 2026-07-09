/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        law: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8c5df8",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        // Official Texas Tech University brand red (#E90802), scaled for UI use
        ttu: {
          50:  "#fef2f2",
          100: "#fde2e1",
          200: "#fbc4c2",
          300: "#f79490",
          400: "#f15b54",
          500: "#e90802",
          600: "#cc0000",
          700: "#a30000",
          800: "#7a0000",
          900: "#520000",
        },
      },
    },
  },
  plugins: [],
};