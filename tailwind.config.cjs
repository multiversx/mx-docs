const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
    container: false,
  },

  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{jsx,tsx,html}"],
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        roobert: ['"Roobert Regular"', ...fontFamily.sans],
        "roobert-medium": ['"Roobert Medium"', ...fontFamily.sans],
        "roobert-semibold": ['"Roobert SemiBold"', ...fontFamily.sans],
      },
      colors: {
        neutral: {
          400: "#23f7dd",
          850: "#212121",
          925: "#0E0E0E",
          1000: "#080808",
        },
        primary: {
          DEFAULT: "var(--ifm-color-primary)",
        },
      },
    },
  },
};
