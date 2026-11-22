import { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

/**
 * Transiciones compartidas. Para cambiar la sensación de toda la app
 * (más rápido/lento) se edita solo este archivo.
 */
export const LAYOUT = LinearTransition.duration(180);
export const FADE_IN = FadeIn.duration(150);
export const FADE_OUT = FadeOut.duration(120);
