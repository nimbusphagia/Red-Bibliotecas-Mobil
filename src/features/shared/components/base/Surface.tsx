import { useContext, type PropsWithChildren, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { cn, ToneContext, tones, type Tone } from "../../theme";
import { Text } from "./Text";

type SurfaceProps = PropsWithChildren<
  ViewProps & {
    tone?: Tone;
    /**
     * Nivel 2 dentro de la superficie actual (darkSolid en dark1, bg en light1).
     * No cambia el tono: el texto y los íconos siguen igual.
     */
    inset?: boolean;
    /** Fila de ItemList con gap: fondo opcional `t.row`. Tampoco cambia el tono. */
    row?: boolean;
    className?: string;
  }
>;

/**
 * Fondo + tono. Todo lo que se dibuje dentro toma sus colores de aquí.
 * Sin `tone` hereda el del padre (útil con `inset`), salvo un contenedor
 * directo sobre el lienzo canvas, que pasa a light.
 * Contenedores: rounded-2xl. Con `inset`: rounded-lg (es una fila/control).
 */
export function Surface({
  tone,
  inset,
  row,
  className,
  children,
  ...rest
}: SurfaceProps) {
  const current = useContext(ToneContext);
  // Un contenedor sobre el lienzo es light (white); inset y row heredan el tono.
  const name =
    tone ?? (current === "canvas" && !inset && !row ? "light" : current);
  const t = tones[name];
  return (
    <ToneContext.Provider value={name}>
      <View
        className={cn(
          inset
            ? [t.inset, "rounded-lg"]
            : row
              ? [t.row, "rounded-lg"]
              : [t.surface, "rounded-2xl"],
          className,
        )}
        {...rest}
      >
        {children}
      </View>
    </ToneContext.Provider>
  );
}

type PanelProps = PropsWithChildren<{
  title?: string;
  titleClassName?: string;
  lead?: ReactNode;
  tone?: Tone;
  className?: string;
}>;

/** Surface con encabezado (título y acción opcional). */
export function Panel({
  title,
  titleClassName,
  lead,
  tone,
  className,
  children,
}: PanelProps) {
  return (
    <Surface tone={tone} className={cn("gap-2 p-5", className)}>
      {(title || lead) && (
        <View className="mb-2 flex-row items-center justify-between gap-4">
          {title ? (
            <Text variant="section" className={titleClassName}>
              {title}
            </Text>
          ) : (
            <View />
          )}
          {/* Margen negativo: el lead (p. ej. un botón) no agranda el encabezado,
              así el título queda igual con o sin acción. */}
          {lead && (
            <View className="-my-2 flex-1 flex-row justify-end">{lead}</View>
          )}
        </View>
      )}
      {children}
    </Surface>
  );
}
