/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fbf8f4',
          100: '#f5eee6',
          200: '#ebdccf',
          300: '#dcbfab',
          400: '#c89d81',
          500: '#b78060',
          600: '#9b6448',
          700: '#7e4f3a',
          800: '#674233',
          900: '#54372c',
          950: '#2e1c16',
        },
      },
    },
  },
  plugins: [],
};
