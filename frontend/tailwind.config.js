/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: "#B0CB1F",
          dark: "#8DA219",
          light: "#D9E67A",
        },
        ink: {
          DEFAULT: "#17180F",
          soft: "#2B2C22",
        },
        cream: {
          DEFAULT: "#EEF2D2",
          light: "#F7F8EE",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
      },
    },
  },
  plugins: [],
};
