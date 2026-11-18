import { View } from "react-native";
import { cn, colors } from "../../theme";
import { Text } from "../base/Text";
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
    text: "",
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
          className={cn(
            "text-[15px]",
            variant && columnVariants[variant].text,
            textClass,
          )}
          numberOfLines={1}
        >
          {text}
        </Text>
      )}
      {children}
      {variant === "subtitled" && !!(subtitle1 || subtitle2) && (
        <View className="flex-row justify-start items-center">
          <Text variant="subtitle">{subtitle1}</Text>
          {subtitle1 && subtitle2 && <Dot color={colors.secondary} />}
          <Text variant="subtitle">{subtitle2}</Text>
        </View>
      )}
    </View>
  );
}
