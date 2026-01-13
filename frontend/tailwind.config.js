/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html", // scan all HTML files in public
    "./src/**/*.js", // scan any JS files that may contain Tailwind classes
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Oswald", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
