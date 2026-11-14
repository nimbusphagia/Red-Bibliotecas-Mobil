import { View } from "react-native";
import { cn } from "../../theme";
import { Text, TextVariant } from "../base/Text";
import { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

export function PillRow({ children, className }: Props) {
  return (
    <View
      className={cn(
        "border border-fg1 flex-row justify-between gap-5 py-3 px-7 rounded-full bg-fg2",
        className,
      )}
    >
      {children}
    </View>
  );
}

const columnStyles = {
  text: "text-primary",
  badge:
    "bg-fg1 rounded-full px-4 py-[5px] border border-fg1 self-center text-center text-highlight",
  highlight:
    "border-fg1 border px-4 py-[5px] bg-primary text-bg text-center rounded-full",
};

type ColumnProps = {
  title: string;
  variant?: keyof typeof columnStyles;
  textVariant?: TextVariant;
};

export function PillRowColumn({
  title,
  variant = "text",
  textVariant = "subtitle",
}: ColumnProps) {
  return (
    <View className="flex-row justify-center items-center">
      <Text variant={textVariant} className={columnStyles[variant]}>
        {title}
      </Text>
    </View>
  );
}
