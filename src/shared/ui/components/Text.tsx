import { Text as RNText, type TextProps } from "react-native";
import { cn } from "../utils";

type Variable = "h1" | "h2" | "h3" | "subtitle";
type Props = {
  variable?: Variable;
  className?: string;
};
export function Text({ variable, className, ...props }: TextProps & Props) {
  let variableClass;
  switch (variable) {
    case "h3":
      variableClass = "font-semibold text-[16px] text-highlight";
      break;
    case "subtitle":
      variableClass = "font-medium text-[14px] text-primary";
      break;
    default:
      "";
  }
  return (
    <RNText className={cn("font-sans", variableClass, className)} {...props} />
  );
}
