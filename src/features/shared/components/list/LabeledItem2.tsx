import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Props = {
  label: string;
  content: string;
  expand?: boolean;
  className?: string;
  labelClass?: string;
  contentClass?: string;
};

export function LabeledItem2({
  label,
  content,
  expand,
  className,
  labelClass,
  contentClass,
}: Props) {
  const baseTextClass = cn("py-[5px] px-[15px] border");
  const rounded = "rounded-lg";
  return (
    <View
      className={cn(
        rounded,
        "flex-row items-center gap-[10px]",
        expand && "flex-1",
        className,
      )}
    >
      <Text
        variant="itemSm"
        className={cn(
          baseTextClass,
          rounded,
          "text-bg bg-primary text-center border-primary",
          labelClass,
        )}
      >
        {label}
      </Text>
      <Text
        variant="itemSm"
        numberOfLines={1}
        className={cn(
          baseTextClass,
          rounded,
          "bg-fg1/60 flex-1 border-fg1",
          contentClass,
        )}
      >
        {content}
      </Text>
    </View>
  );
}
