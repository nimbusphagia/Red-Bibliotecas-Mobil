import { View } from "react-native";
import { cn, useTone } from "../../theme";
import { Text } from "../base/Text";

/**
 * pill: valor de solo lectura. input: campo editable (FieldRow).
 * Los colores salen de la superficie: etiqueta = t.tag, campo = t.inset,
 * campo con valor = accent2.
 */
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
  const cell = `rounded-lg px-2 py-2 ${input && "font-sans-medium"}`;

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
        variant="item"
        className={cn(
          cell,
          t.tag,
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
          "flex-1 text-right",
          input && !empty ? "bg-accent2 text-dark1" : t.inset,
          empty && !input && "text-dark3",
          contentClass,
        )}
      >
        {content || ""}
      </Text>
    </View>
  );
}
