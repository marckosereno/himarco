/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'spline': ['Spline Sans Light', 'sans-serif'],
        'spline-medium': ['Spline Sans Medium', 'sans-serif'],
        'avenir': ['Avenir', 'sans-serif'],
        'fh-oscar': ['FH Oscar Test Medium', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
