import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

export type LabeledItemVariant = "pill" | "box";

const labelWidths = {
  narrow: "w-[35%]",
  wide: "w-[40%]",
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
  const box = variant === "box";
  const empty = !content;
  const cell = "rounded-lg px-4 py-2 bg-bg";

  return (
    <View
      className={cn(
        "flex-row items-center",
        labelWidth === "narrow" ? "gap-6" : "gap-2",
        box ? "rounded-xl gap-2" : "justify-between",
        expand && "flex-1",
        className,
      )}
    >
      <Text
        variant="item"
        className={cn(
          cell,
          box
            ? " bg-dark2 text-center text-white"
            : cn(
                " border border-dark2",
                empty ? "bg-bg text-dark2 " : "bg-dark2 text-bg ",
              ),
          labelWidth && labelWidths[labelWidth],
          labelClass,
        )}
      >
        {label}
      </Text>
      <Text
        variant="item"
        numberOfLines={1}
        className={cn(
          cell,
          box ? "flex-1 text-dark1 text-start" : "text-dark1 flex-1 text-right",
          empty && " text-dark2",
          contentClass,
        )}
      >
        {content || "---"}
      </Text>
    </View>
  );
}
