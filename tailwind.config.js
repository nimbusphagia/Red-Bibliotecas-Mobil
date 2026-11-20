const { palette } = require("./src/features/shared/theme/palette");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit_400Regular"],
        "sans-medium": ["Outfit_500Medium"],
        "sans-semibold": ["Outfit_600SemiBold"],
        "sans-bold": ["Outfit_700Bold"],
      },
      colors: palette,
      // Escala de espaciado: xs=1 (4) · sm=2 (8) · md=3 (12) · lg=4 (16) · xl=6 (24) · 2xl=8 (32)
    },
  },
  plugins: [],
};
