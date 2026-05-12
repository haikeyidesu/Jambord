/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jamboard: {
          blue: '#1a73e8',
          red: '#d93025',
          green: '#188038',
          yellow: '#f9ab00',
          stickyNote: '#ffff88',
        },
      },
      backgroundImage: {
        'dot-grid': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23cccccc' fill-opacity='0.3'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
