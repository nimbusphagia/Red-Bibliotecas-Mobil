import { createContext, useContext } from "react";
import type { ColorName } from "./colors";

/**
 * Tono de la superficie donde se está dibujando.
 * - light → fondo `white`
 * - dark  → fondo `dark1`
 * El lienzo de la página (`bg`) cuenta como light.
 *
 * RN no hereda colores, así que `Surface` publica el tono por contexto y
 * Text, Icon, Button, LabeledItem, TextField, Chip... leen de aquí.
 * Para cambiar la paleta de un rol, se edita SOLO esta tabla.
 */
export type Tone = "light" | "dark";

type ButtonStyle = { box: string; label: string; icon: ColorName };

const accent: ButtonStyle = {
  box: "bg-accent2",
  label: "text-dark2",
  icon: "dark2",
};

export const tones = {
  light: {
    surface: "bg-white",
    inset: "bg-bg", // nivel 2: campos, celdas, filas, chips sin seleccionar
    tag: "bg-dark2 text-white", // etiquetas de LabeledItem, badge "pending"
    text: "text-dark1",
    muted: "text-dark3",
    icon: "dark1" as ColorName,
    placeholder: "dark3" as ColorName,
    button: {
      accent,
      solid: { box: "bg-dark1", label: "text-white", icon: "white" },
      soft: { box: "bg-bg", label: "text-dark1", icon: "dark1" },
    },
  },
  dark: {
    surface: "bg-dark1",
    inset: "bg-dark2",
    tag: "bg-dark2 text-white",
    text: "text-white",
    muted: "text-dark3",
    icon: "white" as ColorName,
    placeholder: "dark3" as ColorName,
    button: {
      accent,
      solid: { box: "bg-dark2", label: "text-white", icon: "white" },
      soft: { box: "bg-dark2/60", label: "text-white", icon: "white" },
    },
  },
} as const satisfies Record<Tone, unknown>;

export const ToneContext = createContext<Tone>("light");
export const useTone = () => tones[useContext(ToneContext)];
