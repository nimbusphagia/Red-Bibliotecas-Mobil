import type { LucideIcon } from "lucide-react-native";
import { colors } from "../../theme";

const sizes = { sm: 12, md: 14, lg: 18 } as const;
const strokes = { sm: 1.5, md: 2.5, lg: 3 } as const;

export type IconSize = keyof typeof sizes;
export type IconStroke = keyof typeof strokes;
export type IconTone =
  | "bg"
  | "dark1"
  | "dark2"
  | "dark3"
  | "primary"
  | "secondary"
  | "accent1"
  | "accent2"
  | "highlight"
  | "white"
  | "dark1"
  | "error"
  | "success"
  | "warning";

type Props = {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  stroke?: IconStroke;
};

export function Icon({
  icon: Glyph,
  size = "md",
  tone = "white",
  stroke = "md",
}: Props) {
  return (
    <Glyph
      size={sizes[size]}
      color={colors[tone]}
      strokeWidth={strokes[stroke]}
    />
  );
}
