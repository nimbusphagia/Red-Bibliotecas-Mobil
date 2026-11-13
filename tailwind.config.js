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
      colors: {
        bg: "#FAF8F5",
        fg1: "#F2ECE9",
        fg2: "#F7F3F0",
        primary: "#6996CF",
        secondary: "#8AAAD4",
        highlight: "#5789C9",
      },
    },
  },
  plugins: [],
};
