const { palette, fonts } = require("./src/features/shared/theme/palette");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: Object.fromEntries(
        Object.entries(fonts).map(([k, v]) => [k, [v]]),
      ),
      colors: palette,
    },
  },
  plugins: [],
};
