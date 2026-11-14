import { Text as RNText, type TextProps } from "react-native";
import { cn } from "../../theme";

export type TextVariant = "h1" | "h2" | "h3" | "subtitle";
type Props = {
  variant?: TextVariant;
  className?: string;
};
export function Text({ variant, className, ...props }: TextProps & Props) {
  let variantClass;
  switch (variant) {
    case "h1":
      variantClass = "font-sans-bold text-[20px] text-primary";
      break;
    case "h2":
      variantClass = "font-sans-semibold text-[18px] text-primary";
      break;
    case "h3":
      variantClass = "font-sans-medium text-[16px] text-primary";
      break;
    case "subtitle":
      variantClass = "font-sans-medium text-[14px] text-secondary";
      break;
    default:
      "";
  }
  return (
    <RNText className={cn("font-sans", variantClass, className)} {...props} />
  );
}
