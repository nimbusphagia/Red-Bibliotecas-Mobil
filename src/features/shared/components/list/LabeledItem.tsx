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
  const cell = "border px-4 py-1";

  return (
    <View
      className={cn(
        "flex-row items-center ",
        box ? "rounded-xl gap-2" : "justify-between rounded-full bg-bg",
        expand && "flex-1",
        className,
      )}
    >
      <Text
        variant="item"
        className={cn(
          cell,
          box
            ? "bg-bg rounded-xl border-transparent text-center text-dark1"
            : cn(
                "rounded-full border-transparent",
                empty ? "text-dark3" : "bg-dark2 text-white",
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
          box
            ? "flex-1 rounded-xl border-dark1 bg-dark1 text-white text-center"
            : "rounded-r-full border-transparent",
          empty && "text-dark3",
          contentClass,
        )}
      >
        {content || "---"}
      </Text>
    </View>
  );
}
