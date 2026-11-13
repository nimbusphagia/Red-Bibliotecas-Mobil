import { Text as RNText, type TextProps } from "react-native";
import { cn } from "../theme";

type Variant = "h1" | "h2" | "h3" | "subtitle";
type Props = {
  variant?: Variant;
  className?: string;
};
export function Text({ variant, className, ...props }: TextProps & Props) {
  let variantClass;
  switch (variant) {
    case "h1":
      variantClass = "font-sans-bold text-[20px] text-highlight";
      break;
    case "h2":
      variantClass = "font-sans-semibold text-[18px] text-highlight";
      break;
    case "h3":
      variantClass = "font-semibold text-[16px] text-highlight";
      break;
    case "subtitle":
      variantClass = "font-medium text-[14px] text-primary";
      break;
    default:
      "";
  }
  return (
    <RNText className={cn("font-sans", variantClass, className)} {...props} />
  );
}
