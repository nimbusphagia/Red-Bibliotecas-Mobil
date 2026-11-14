import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text, TextVariant } from "../base/Text";

type Props = {
  children: ReactNode;
  className?: string;
  expand?: boolean;
};
export function PillRow({ children, className, expand = true }: Props) {
  return (
    <View
      className={cn(
        "border border-fg1 flex-row justify-between gap-5 py-3 px-7 rounded-full bg-fg2",
        expand ? "flex-1" : "",
        className,
      )}
    >
      {children}
    </View>
  );
}

type ColumnProps = {
  title?: string;
  expand?: boolean;
  variant?: "text" | "badge" | "highlight" | "children";
  textVariant?: TextVariant;
  containerClass?: string;
  textClass?: string;
};
export function PillRowColumn({
  title,
  expand = false,
  variant = "text",
  textVariant = "subtitle",
  containerClass = "",
  textClass = "",
  children,
}: PropsWithChildren<ColumnProps>) {
  const containerOnly = variant === "children";
  const variantClass = {
    text: "text-primary",
    badge:
      "bg-fg1 rounded-full px-4 py-[5px] border border-fg1 self-center text-center",
    highlight:
      "border-fg1 border px-4 py-[5px] rounded-lg bg-primary text-bg text-center rounded-full",
    children: "",
  };

  return (
    <View
      className={cn(
        "flex-row justify-center items-center",
        containerOnly ? "gap-4" : "",
        expand ? "flex-1" : "",
        containerClass,
      )}
    >
      {containerOnly ? (
        children
      ) : (
        <Text
          variant={textVariant}
          className={cn(variantClass[variant], textClass)}
        >
          {title}
        </Text>
      )}
    </View>
  );
}
