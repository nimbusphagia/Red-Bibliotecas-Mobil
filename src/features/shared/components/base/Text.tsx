import { Text as RNText, type TextProps } from "react-native";
import { cn } from "../../theme";

export type TextVariant =
  "display" | "title" | "section" | "item" | "itemSm" | "caption";

const variantStyles: Record<TextVariant, string> = {
  display: "font-sans-semibold text-[28px] text-dark1",
  title: "font-sans-medium text-[24px] text-dark1",
  section: "font-sans text-[18px] text-dark1",
  item: "font-sans text-[14px] text-dark1",
  itemSm: "font-sans text-[14px] text-dark1",
  caption: "font-sans text-[14px] text-dark3",
};

type Props = TextProps & { variant?: TextVariant; className?: string };

export function Text({ variant, className, ...props }: Props) {
  return (
    <RNText
      className={cn("font-sans", variant && variantStyles[variant], className)}
      {...props}
    />
  );
}
