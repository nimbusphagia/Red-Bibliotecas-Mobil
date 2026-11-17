import { View } from "react-native";
import { cn, colors } from "../../theme";
import { Text, TextVariant } from "../base/Text";
import { PropsWithChildren, ReactNode } from "react";
import { Dot } from "lucide-react-native";

type Props = { children: ReactNode; className?: string };

export function PillRow({ children, className }: Props) {
  return (
    <View
      className={cn(
        "border border-fg1 flex-row justify-between gap-8 py-2 px-5 rounded-lg bg-fg2",
        className,
      )}
    >
      {children}
    </View>
  );
}
const columnVariants = {
  id: {
    container: "max-w-[40px] justify-center items-center",
    text: "font-semibold text-center",
  },
  subtitled: {
    container: "flex-col justify-center items-start ",
    text: "text-[15px]",
  },
  date: { container: "", text: "" },
  actions: { container: "flex-row justify-center gap-6", text: "" },
};

type ColumnProps = {
  text?: string;
  variant?: keyof typeof columnVariants;
  subtitle1?: string;
  subtitle2?: string;
  expand?: boolean;
  containerClass?: string;
  textClass?: string;
};

export function Column({
  text,
  variant,
  subtitle1,
  subtitle2,
  expand = true,
  containerClass,
  textClass,
  children,
}: PropsWithChildren<ColumnProps>) {
  return (
    <View
      className={cn(
        "flex-row items-center",
        expand && "flex-1",
        variant && columnVariants[variant].container,
        containerClass,
      )}
    >
      {text && (
        <Text
          variant="h3"
          className={cn(variant && columnVariants[variant].text, textClass)}
        >
          {text}
        </Text>
      )}
      {variant === "subtitled" && (
        <View className="flex-row justify-start">
          <Text variant="subtitle">{subtitle1}</Text>
          {subtitle1! && subtitle2 && <Dot color={colors.secondary} />}
          <Text variant="subtitle">{subtitle2}</Text>
        </View>
      )}
      {variant === "actions" && children}
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

type PillColumnProps = {
  title: string;
  variant?: keyof typeof columnStyles;
  textVariant?: TextVariant;
};

export function PillRowColumn({
  title,
  variant = "text",
  textVariant = "subtitle",
}: PillColumnProps) {
  return (
    <View className="flex-row justify-center items-center">
      <Text variant={textVariant} className={columnStyles[variant]}>
        {title}
      </Text>
    </View>
  );
}
