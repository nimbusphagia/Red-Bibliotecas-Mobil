import { createContext, useContext } from "react";
import type { ColorName } from "./colors";

/**
 * Tono de la superficie donde se está dibujando.
 * - canvas → fondo `bg`: el lienzo de la página (y diálogos sobre bg)
 * - light  → fondo `light1`: contenedores y secciones
 * - dark   → fondo `dark1`: sidebar, toolbars, diálogos oscuros
 *
 * RN no hereda colores, así que `Surface` publica el tono por contexto y
 * Text, Icon, Button, LabeledItem, TextField, Chip... leen de aquí. Ningún
 * componente debería elegir un color por su cuenta: si necesita uno, se
 * agrega como ROL en esta tabla. Para cambiar la paleta de un rol, se edita
 * SOLO esta tabla.
 */
export type Tone = "canvas" | "light" | "dark";

type Box = { box: string; label: string; icon: ColorName };
type Accent = Box & { focus: string };
type ChipStyle = {
  box: string;
  label: string;
  icon: ColorName;
  dot: ColorName;
};

export type ToneStyle = {
  surface: string; // fondo del contenedor
  inset: string; // nivel 2: campos, celdas, chips sin seleccionar
  row: string; // fondo opcional de filas de ItemList (con gap)
  valueFilled: string; // valor de un LabeledItem input con contenido
  tag: { empty: string; filled: string }; // etiqueta de LabeledItem
  text: string;
  muted: string; // texto secundario (captions)
  faint: string; // vacíos, ayudas
  divider: string; // bordes y separadores
  icon: ColorName;
  placeholder: ColorName; // placeholders y detalles tenues (también Icon "faint")
  accentFg: ColorName; // acento como color de primer plano (Icon "accent")
  accent: Accent;
  chip: { idle: ChipStyle; selected: ChipStyle };
  button: { accent: Box; solid: Box; soft: Box; selector: Box };
};

const accentDark: Accent = {
  box: "bg-darkAccent",
  label: "text-darkSolid",
  icon: "darkSolid",
  focus: "focus:border-darkAccent",
};
const accentLight: Accent = {
  box: "bg-lightAccent",
  label: "text-darkSolid",
  icon: "darkSolid",
  focus: "focus:border-lightAccent",
};

const chipDark = {
  idle: {
    box: "bg-darkSolid",
    label: "text-light1",
    icon: "light1",
    dot: "dark2",
  },
  selected: {
    box: "bg-darkAccent",
    label: "text-darkSolid",
    icon: "darkSolid",
    dot: "dark1",
  },
} as const;
// No es simétrico con dark a propósito: en light el chip es lightSolid.
const chipLight = {
  idle: {
    box: "bg-lightSolid",
    label: "text-darkSolid",
    icon: "darkSolid",
    dot: "dark2",
  },
  selected: {
    box: "bg-lightAccent",
    label: "text-dark1",
    icon: "dark1",
    dot: "dark1",
  },
} as const;

// Botones que funcionan como selectores/filtros: mismo look que un Chip sin seleccionar.
const selectorLight: Box = {
  box: "bg-lightSolid",
  label: "text-darkSolid",
  icon: "darkSolid",
};

/** Lo que comparten canvas y light (ambos son claros). */
const onLight = {
  tag: {
    empty: "bg-lightSolid text-darkSolid",
    filled: "bg-lightAccent text-dark1",
  },
  text: "text-dark1",
  muted: "text-darkSolid",
  faint: "text-dark2",
  divider: "border-lightSolid",
  icon: "dark1",
  placeholder: "dark2",
  accent: accentLight,
  chip: chipLight,
} as const;

export const tones: Record<Tone, ToneStyle> = {
  canvas: {
    ...onLight,
    surface: "bg-bg",
    inset: "bg-light1",
    row: "bg-light1",
    valueFilled: "bg-light1 text-dark1",
    accentFg: "lightAccent",
    button: {
      accent: accentLight,
      solid: { box: "bg-darkSolid", label: "text-light1", icon: "light1" },
      soft: { box: "bg-light1", label: "text-dark1", icon: "dark1" },
      selector: selectorLight,
    },
  },
  light: {
    ...onLight,
    surface: "bg-light1",
    inset: "bg-bg",
    row: "bg-lightRow",
    valueFilled: "bg-bg text-dark1",
    accentFg: "darkSolid",
    button: {
      accent: accentLight,
      solid: { box: "bg-darkSolid", label: "text-light1", icon: "light1" },
      soft: { box: "bg-bg", label: "text-dark1", icon: "dark1" },
      selector: selectorLight,
    },
  },
  dark: {
    surface: "bg-dark1",
    inset: "bg-darkSolid",
    row: "bg-darkSolid",
    valueFilled: "bg-bg text-dark1",
    tag: {
      empty: "bg-darkSolid text-light1",
      filled: "bg-darkSolid text-light1",
    },
    text: "text-light1",
    muted: "text-lightSolid",
    faint: "text-dark2",
    divider: "border-darkSolid",
    icon: "light1",
    placeholder: "dark2",
    accentFg: "darkAccent",
    accent: accentDark,
    chip: chipDark,
    button: {
      accent: accentDark,
      solid: { box: "bg-darkSolid", label: "text-light1", icon: "light1" },
      soft: { box: "bg-darkSolid/60", label: "text-light1", icon: "light1" },
      selector: { box: "bg-darkSolid", label: "text-light1", icon: "light1" },
    },
  },
};

type Status = { text: string; bg: string; border?: string; icon: ColorName };

/**
 * Colores con significado (estado). No dependen del tono: se ven igual sobre
 * cualquier superficie.
 */
export const status: Record<"success" | "info" | "warning" | "error", Status> =
  {
    success: { text: "text-success", bg: "bg-success", icon: "success" },
    info: { text: "text-secondary", bg: "bg-secondary", icon: "secondary" },
    warning: { text: "text-warning", bg: "bg-warning", icon: "warning" },
    error: {
      text: "text-error",
      bg: "bg-error",
      border: "border-error",
      icon: "error",
    },
  };

// Sin Surface arriba, lo que se dibuja está sobre el lienzo de la página.
export const ToneContext = createContext<Tone>("canvas");
export const useTone = () => tones[useContext(ToneContext)];
