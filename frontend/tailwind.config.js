/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#013ca7",
        bg: "#121420",
      },
      fontFamily: {
        oswald: ["Oswald", "sans-serif"],
      },
      boxShadow: {
        card: "rgba(164, 178, 193, 0.2) 0px 8px 24px",
        skill: "0 20px 40px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        slideInOut: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fillBar: {
          from: { width: "0%" },
          to: { width: "var(--final-width)" },
        },
      },
      animation: {
        slideInOut: "slideInOut 5s ease-out forwards",
        fillBar: "fillBar 2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
