/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        win: {
          blue: '#0078D7',
          dark: '#1E1E1E',
          light: '#F5F5F5',
          gray: '#E0E0E0',
          border: '#C0C0C0',
          title: '#005A9E',
          hover: '#106EBE',
          taskbar: '#002B4F',
        }
      }
    },
  },
  plugins: [],
}
