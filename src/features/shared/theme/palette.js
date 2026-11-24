const fonts = {
  sans: "Outfit_300Light",
  "sans-regular": "Outfit_400Regular",
  "sans-medium": "Outfit_500Medium",
  "sans-semibold": "Outfit_600SemiBold",
};

/**
 * Los componentes NO eligen estos colores directo: los toman de
 * theme/tone.ts según la superficie. Aquí solo se definen los valores.
 */
module.exports = {
  fonts,
  palette: {
    // Lienzo de la página (tono canvas)
    bg: "#E8E8F1",

    // light: contenedores claros
    light1: "#FAFAFA", // superficie / texto sobre dark
    lightCard: "#F1F0F8", // ItemCard y filas dentro de un contenedor light
    lightSolid: "#E1E1EF",
    lightAccent: "#AACCF7", // = accentMd
    // TEXT sobre light: dark1 > darkSolid

    // dark: contenedores oscuros
    dark1: "#222026", // superficie / texto sobre light
    darkSolid: "#3F3E43",
    darkAccent: "#AACCF7", // = accentMd
    dark2: "#8D8F93", // gris neutro: placeholders y detalles tenues
    // TEXT sobre dark: light1 > lightSolid

    // acentos de intensidad creciente para chips de valor (theme/tone.ts → accents)
    accentSm: "#CBDEF6",
    accentMd: "#AACCF7",
    accentLg: "#69A3EF",
    accentNeg: "#C2405C",

    secondary: "#8AAAD4",
    error: "#D14343",
    success: "#4E9F6B",
    warning: "#D99A2B",
  },
};
