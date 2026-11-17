import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Props = {
  label: string;
  content?: string;
  expand?: boolean;
  className?: string;
  labelClass?: string;
  contentClass?: string;
};

export function LabeledItem({
  label,
  content,
  expand,
  className,
  labelClass,
  contentClass,
}: Props) {
  const baseTextClass = cn(
    "text-[14px] py-[5px] px-[15px] border border-transparent",
    !content && "text-secondary",
  );
  return (
    <View
      className={cn(
        "flex-row items-center justify-between rounded-full bg-fg1",
        expand && "flex-1",
        className,
      )}
    >
      <Text
        variant="h3"
        className={cn(
          baseTextClass,
          content && "bg-primary text-bg",
          "rounded-full",
          labelClass,
        )}
      >
        {label}
      </Text>
      <Text
        variant="h3"
        numberOfLines={1}
        className={cn(
          baseTextClass,
          content && "text-primary",
          "rounded-r-full",
          contentClass,
        )}
      >
        {content ?? "---"}
      </Text>
    </View>
  );
}
