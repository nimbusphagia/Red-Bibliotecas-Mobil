import { Dot } from "lucide-react-native";
import { View } from "react-native";
import { cn, useTone } from "../../theme";
import { Icon, IconTone } from "./Icon";
import { Text } from "./Text";

type Variant = "active" | "pending" | "finished";
type Props = {
  variant: Variant;
  text: string;
  className?: string;
};

export function StatusBadge({ text, variant, className }: Props) {
  const t = useTone();
  const variantClass = {
    active: "text-success",
    pending: "text-accent1",
    finished: cn(t.text),
  };
  return (
    <Text
      variant="itemSm"
      className={cn(
        "overflow-hidden rounded-lg px-3 py-1",
        variantClass[variant],
        className,
      )}
    >
      {text}
    </Text>
  );
}

export function StatusIndicator({
  text,
  tone,
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
