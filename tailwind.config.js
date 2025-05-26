// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}', // adjust to your file structure
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D4ED8',   // primary (blue-700)
          dark: '#1E40AF',      // primary-dark (blue-800)
        },
        secondary: {
          DEFAULT: '#10B981',   // secondary (green-500)
          dark: '#047857',      // secondary-dark (green-700)
        },
      },
    },
  },
  plugins: [],
};


