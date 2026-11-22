import { View } from "react-native";
import { cn, useTone } from "../../theme";
import { Text } from "../base/Text";

export type LabeledItemVariant = "pill" | "input";

const labelWidths = {
  narrow: "w-[28%]",
  wide: "w-[30%]",
  form: "w-[110px]",
};
type Props = {
  label: string;
  content?: string;
  variant?: LabeledItemVariant;
  expand?: boolean;
  className?: string;
  labelClass?: string;
  labelWidth?: keyof typeof labelWidths;
  contentClass?: string;
};

export function LabeledItem({
  label,
  content,
  variant = "pill",
  expand,
  className,
  labelClass,
  labelWidth,
  contentClass,
}: Props) {
  const t = useTone();
  const input = variant === "input";
  const empty = !content;
  const cell = "rounded-lg px-2 py-2 font-sans-regular";

  return (
    <View
      className={cn(
        "flex-row items-center justify-between",
        labelWidth === "narrow" ? "gap-6" : "gap-2",
        expand && "flex-1",
        className,
      )}
    >
      <Text
        variant="itemSm"
        className={cn(
          cell,
          empty ? t.tag.empty : t.tag.filled,
          input && "text-center",
          labelWidth && labelWidths[labelWidth],
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
          "flex-1 text-right",
          input && !empty ? [t.valueFilled, "text-left"] : t.inset,
          empty && !input && t.faint,
          contentClass,
        )}
      >
        {content || (!input && "---")}
      </Text>
    </View>
  );
}
