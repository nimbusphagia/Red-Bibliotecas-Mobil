import type { LucideIcon } from "lucide-react-native";
import { colors, useTone, type ColorName } from "../../theme";

const sizes = { sm: 12, md: 14, lg: 16, xl: 18 } as const;
const strokes = { sm: 1.5, md: 2.5, lg: 3, xl: 3 } as const;

export type IconSize = keyof typeof sizes;
export type IconStroke = keyof typeof strokes;
/** Un color de la paleta, o "faint" (detalles tenues, separadores), que sale del tono actual. */
export type IconTone = ColorName | "faint";

type Props = {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  stroke?: IconStroke;
};

export function Icon({ icon: Glyph, size = "md", tone, stroke = "md" }: Props) {
  const t = useTone();
  const color = tone === "faint" ? t.placeholder : (tone ?? t.icon);
  return (
    <Glyph
      size={sizes[size]}
      color={colors[color]}
      strokeWidth={strokes[stroke]}
    />
  );
}
