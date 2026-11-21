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
      // Escala de espaciado: xs=1 (4) · sm=2 (8) · md=3 (12) · lg=4 (16) · xl=6 (24) · 2xl=8 (32)
    },
  },
  plugins: [],
};
