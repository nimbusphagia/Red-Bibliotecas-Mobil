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
        background: "#F2EEDF",
        foreground: "#E6E0D3",
        primary: "#997DA8",
        highlight: "#A47BBA",
      },
    },
  },
  plugins: [],
};
