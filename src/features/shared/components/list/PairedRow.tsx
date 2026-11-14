import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Variant = "field" | "code";

const styles: Record<
  Variant,
  {
    container: string;
    label: string;
    labelFilled: string;
    content: string;
    contentFilled: string;
  }
> = {
  field: {
    container: "rounded-lg border",
    label: "w-[120px] rounded-l-lg bg-fg2 pl-4 text-highlight",
    labelFilled: "bg-primary text-bg",
    content: "flex-1 rounded-r-lg bg-fg2 pr-4 text-right",
    contentFilled: "bg-fg1",
  },
  code: {
    container: "gap-2",
    label: "w-[60] rounded-lg bg-primary text-center text-bg font-sans-bold",
    labelFilled: "",
    content: "flex-1 rounded-lg border border-fg1 bg-fg2 px-4",
    contentFilled: "",
  },
};

type Props = {
  label: string;
  content: string | null;
  variant?: Variant;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  labelClass?: string;
  contentClass?: string;
};

export function PairedRow({
  label,
  content,
  variant = "field",
  error,
  disabled,
  className,
  labelClass,
  contentClass,
}: Props) {
  const s = styles[variant];
  const filled = content !== null;
  const disabledClass = disabled && "bg-fg1/60 text-primary/70";

  return (
    <View
      className={cn(
        "w-full flex-row items-center justify-between",
        s.container,
        variant === "field" && (error ? "border-red-500" : "border-fg1"),
        className,
      )}
    >
      <Text
        variant="h3"
        className={cn(
          "max-w-full py-[6]",
          s.label,
          filled && s.labelFilled,
          disabledClass,
          labelClass,
        )}
      >
        {label}
      </Text>
      <Text
        variant="h3"
        numberOfLines={1}
        className={cn(
          "max-w-full py-[6]",
          s.content,
          filled && s.contentFilled,
          disabledClass,
          contentClass,
        )}
      >
        {content ?? "---"}
      </Text>
    </View>
  );
}
