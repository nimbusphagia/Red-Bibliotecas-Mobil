import { Text as RNText, type TextProps } from "react-native";
import { cn } from "../../theme";

export type TextVariant = "h1" | "h2" | "h3" | "subtitle";

const variantStyles: Record<TextVariant, string> = {
  h1: "font-sans-bold text-[20px] text-primary",
  h2: "font-sans-semibold text-[18px] text-primary",
  h3: "font-sans-medium text-[16px] text-primary",
  subtitle: "font-sans-medium text-[14px] text-secondary",
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
