import type { LucideIcon } from "lucide-react-native";
import { colors, useTone, type ColorName } from "../../theme";

const sizes = { sm: 12, md: 14, lg: 18 } as const;
const strokes = { sm: 1.5, md: 2.5, lg: 3 } as const;

export type IconSize = keyof typeof sizes;
export type IconStroke = keyof typeof strokes;
export type IconTone = ColorName;

type Props = {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  stroke?: IconStroke;
};

export function Icon({ icon: Glyph, size = "md", tone, stroke = "md" }: Props) {
  const t = useTone();
  return (
    <Glyph
      size={sizes[size]}
      color={colors[tone ?? t.icon]}
      strokeWidth={strokes[stroke]}
    />
  );
}
