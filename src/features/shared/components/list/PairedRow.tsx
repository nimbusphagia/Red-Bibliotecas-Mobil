import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Props = {
  label: string | null;
  content: string | null;
  quoted?: boolean;
  highlight?: "label" | "content";
  fixedHighlight?: string;
  containerClass?: string;
  labelClass?: string;
  contentClass?: string;
};

export function PairedRow({
  label,
  content,
  highlight,
  quoted = false,
  containerClass = "",
  labelClass = "",
  contentClass = "",
}: Props) {
  const textClass = "py-[5] max-w-full";
  const highlighted = "bg-primary text-bg";

  if (content === null || label === null) return;
  return (
    <View
      className={cn(
        "w-full flex-row items-center justify-between",
        containerClass,
      )}
    >
      <Text
        variant="h3"
        className={cn(
          textClass,
          highlight === "label" ? highlighted : "",
          labelClass,
        )}
      >
        {label}
      </Text>
      <Text
        variant="h2"
        numberOfLines={1}
        className={cn(
          textClass,
          highlight === "content" ? highlighted : "",
          contentClass,
        )}
      >
        {quoted ? `"${content}"` : content}
      </Text>
    </View>
  );
}
