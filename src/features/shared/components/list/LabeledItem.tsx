// shared/components/list/LabeledItem.tsx
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

export type LabeledItemVariant = "pill" | "box";

type Props = {
  label: string;
  content?: string;
  variant?: LabeledItemVariant;
  expand?: boolean;
  className?: string;
  labelClass?: string;
  contentClass?: string;
};

export function LabeledItem({
  label,
  content,
  variant = "pill",
  expand,
  className,
  labelClass,
  contentClass,
}: Props) {
  const box = variant === "box";
  const empty = !content;
  const cell = "border px-4 py-1";

  return (
    <View
      className={cn(
        "flex-row items-center",
        box ? "gap-2" : "justify-between rounded-full bg-fg1",
        expand && "flex-1",
        className,
      )}
    >
      <Text
        variant="itemSm"
        className={cn(
          cell,
          box
            ? "rounded-lg border-primary bg-primary text-center text-bg"
            : cn(
                "rounded-full border-transparent",
                empty ? "text-secondary" : "bg-primary text-bg",
              ),
          labelClass,
        )}
      >
        {label}
      </Text>
      <Text
        variant="itemSm"
        numberOfLines={1}
        className={cn(
          cell,
          box
            ? "flex-1 rounded-lg border-fg1 bg-fg1/60"
            : "rounded-r-full border-transparent",
          empty && "text-secondary",
          contentClass,
        )}
      >
        {content || "---"}
      </Text>
    </View>
  );
}
