import { Text as RNText, type TextProps } from "react-native";
import { cn } from "../../theme";

export type TextVariant =
  "display" | "title" | "section" | "item" | "itemSm" | "caption";

const variantStyles: Record<TextVariant, string> = {
  display: "font-sans-bold text-[28px] text-highlight",
  title: "font-sans-semibold text-[24px] text-highlight",
  section: "font-sans-semibold text-[18px] text-primary",
  item: "font-sans-medium text-[16px] text-primary",
  itemSm: "font-sans-medium text-[14px] text-primary",
  caption: "font-sans-medium text-[14px] text-secondary",
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
