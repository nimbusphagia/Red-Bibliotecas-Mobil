import type { LucideIcon } from "lucide-react-native";
import { colors } from "../../theme";

const sizes = { sm: 14, md: 18, lg: 24 } as const;

export type IconSize = keyof typeof sizes;
export type IconTone =
  | "bg"
  | "primary"
  | "secondary"
  | "highlight"
  | "error"
  | "success"
  | "warning";

type Props = { icon: LucideIcon; size?: IconSize; tone?: IconTone };

export function Icon({ icon: Glyph, size = "md", tone = "primary" }: Props) {
  return <Glyph size={sizes[size]} color={colors[tone]} strokeWidth={2} />;
}
