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
        sans: ["Roobert", "system-ui", ...fontFamily.sans],
      },
      colors: {
        neutral: {
          850: "#212121",
          925: "#0E0E0E",
          1000: "#080808",
        },
        teal: {
          400: "#23f7dd",
        },
        primary: {
          DEFAULT: "var(--ifm-color-primary)",
        },
      },
    },
  },
};
