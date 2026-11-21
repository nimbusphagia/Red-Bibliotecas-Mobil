import { View } from "react-native";
import { cn } from "../../theme";
import { Icon, IconTone } from "./Icon";
import { Text } from "./Text";
import { Dot } from "lucide-react-native";

type Variant = "active" | "pending" | "finished";
type Props = {
  variant: Variant;
  text: string;
  className?: string;
};
export function StatusBadge({ text, variant, className }: Props) {
  const baseClass = "px-3 py-1 rounded-full";
  const variantClass = {
    active: "border border-fg1 bg-fg1/50 text-dark2",
    pending: "bg-dark2 text-bg",
    finished: "border border-fg1 bg-fg1/50 text-dark2  rounded-full",
  };
  return (
    <Text
      variant="caption"
      className={cn(baseClass, variantClass[variant], className)}
    >
      {text}
    </Text>
  );
}

export function StatusIndicator({
  text,
  tone = "primary",
}: {
  text: string;
  tone?: IconTone;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon icon={Dot} tone={tone} />
      <Text variant="item">{text}</Text>
    </View>
  );
}
