import { useContext, type PropsWithChildren, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { cn, ToneContext, tones, type Tone } from "../../theme";
import { Text } from "./Text";

type SurfaceProps = PropsWithChildren<
  ViewProps & {
    tone?: Tone;
    /**
     * Nivel 2 dentro de la superficie actual (dark2 en dark1, bg en white).
     * No cambia el tono: el texto y los íconos siguen igual.
     */
    inset?: boolean;
    className?: string;
  }
>;

/**
 * Fondo + tono. Todo lo que se dibuje dentro toma sus colores de aquí.
 * Sin `tone` hereda el del padre (útil con `inset`).
 * Contenedores: rounded-2xl. Con `inset`: rounded-lg (es una fila/control).
 */
export function Surface({
  tone,
  inset,
  className,
  children,
  ...rest
}: SurfaceProps) {
  const current = useContext(ToneContext);
  const name = tone ?? current;
  const t = tones[name];
  return (
    <ToneContext.Provider value={name}>
      <View
        className={cn(
          inset ? [t.inset, "rounded-lg"] : [t.surface, "rounded-2xl"],
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
  lead?: ReactNode;
  tone?: Tone;
  className?: string;
}>;

/** Surface + encabezado. Reemplaza FormSection, Card y el wrapper de DetailColumns. */
export function Panel({ title, lead, tone, className, children }: PanelProps) {
  return (
    <Surface tone={tone} className={cn("gap-2 p-5", className)}>
      {(title || lead) && (
        <View className="min-h-10 flex-row items-center justify-between gap-2">
          {title ? <Text variant="section">{title}</Text> : <View />}
          {lead}
        </View>
      )}
      {children}
    </Surface>
  );
}
