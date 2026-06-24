/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#10b981',
        danger: '#ef4444',
        muted: '#6b7280',
      },
    },
  },
  plugins: [],
};
