import { Dot } from "lucide-react-native";
import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";
import { Icon } from "../base/Icon";

type Props = { children: ReactNode; compact?: boolean; className?: string };

export function ListRow({ children, compact, className }: Props) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between gap-3 rounded-full border border-fg1 bg-fg2 px-4",
        compact ? "py-1" : "py-2",
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
    text: "font-sans-semibold text-center",
  },
  subtitled: {
    container: "flex-col justify-center items-start ",
    text: "",
  },
  date: { container: "", text: "" },
  actions: { container: "flex-row justify-center gap-3", text: "" },
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
          variant="itemSm"
          className={cn(variant && columnVariants[variant].text, textClass)}
          numberOfLines={1}
        >
          {text}
        </Text>
      )}
      {children}
      {variant === "subtitled" && !!(subtitle1 || subtitle2) && (
        <View className="flex-row justify-start items-center">
          <Text variant="caption">{subtitle1}</Text>
          {subtitle1 && subtitle2 && <Icon icon={Dot} tone="secondary" />}
          <Text variant="caption">{subtitle2}</Text>
        </View>
      )}
    </View>
  );
}
