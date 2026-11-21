// Única fuente de verdad: la consumen tailwind.config.js, cn.ts y colors.ts.
const fonts = {
  sans: "Outfit_300Light",
  "sans-regular": "Outfit_400Regular",
  "sans-medium": "Outfit_500Medium",
  "sans-semibold": "Outfit_600SemiBold",
};

module.exports = {
  fonts,
  palette: {
    bg: "#F5F7FB",
    white: "#FFFFFF",

    dark1: "#222026",
    dark2: "#3F3E43",
    dark3: "#8D8F93",

    accent1: "#887FC2",
    accent2: "#DBD3F5",

    fg1: "#F2ECE9",
    fg2: "#F7F3F0",

    primary: "#6996CF",
    secondary: "#8AAAD4",

    highlight: "#5789C9",
    error: "#D14343",
    success: "#4E9F6B",
    warning: "#D99A2B",
  },
};
