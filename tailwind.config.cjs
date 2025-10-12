/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {} },
  plugins: [require("nativewind/preset")],
};
