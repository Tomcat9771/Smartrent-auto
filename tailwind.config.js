/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./node_modules/@headlessui/react/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Tailwind's blue-600
        secondary: "#22c55e", // Tailwind's green-500
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};


