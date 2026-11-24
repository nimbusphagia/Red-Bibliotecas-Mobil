import { View } from "react-native";
import { accents, cn, useTone, type AccentLevel } from "../../theme";
import { Text } from "../base/Text";

export type LabeledItemVariant = "pill" | "input";

const labelWidths = {
  narrow: "w-[28%]",
  wide: "w-[30%]",
  form: "w-[110px]",
  formWide: "w-[140px]",
  fit: "shrink-0 px-4",
};
export type LabelWidth = keyof typeof labelWidths;
type Props = {
  label: string;
  content?: string;
  accent?: AccentLevel;
  muted?: boolean;
  variant?: LabeledItemVariant;
  expand?: boolean;
  className?: string;
  labelClass?: string;
  labelWidth?: LabelWidth;
  contentClass?: string;
};

export function LabeledItem({
  label,
  content,
  accent,
  muted,
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
  const cell = "rounded-lg px-3 py-2 font-sans-regular";

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
          empty || muted ? t.tag.empty : t.tag.filled,
          labelWidth && labelWidths[labelWidth],
          accent && cn(accents[accent].box, accents[accent].label),
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
          "flex-1 text-left",
          input && "px-4",
          input && !empty ? t.valueFilled : t.inset,
          empty && !input && t.faint,
          contentClass,
        )}
      >
        {content || (!input && "---")}
      </Text>
    </View>
  );
}
