import { Dot } from "lucide-react-native";
import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Icon } from "../base/Icon";
import { Surface, useInSection } from "../base/Surface";
import { Text } from "../base/Text";

type Props = {
  children: ReactNode;
  compact?: boolean;
  inset?: boolean;
  className?: string;
};

export function ListRow({ children, compact, inset = true, className }: Props) {
  const inSection = useInSection();
  return (
    <Surface
      row={inset}
      className={cn(
        "flex-row items-center justify-between gap-6",
        inSection ? "px-3" : "px-4",
        compact ? "py-1.5" : "py-3",
        className,
      )}
    >
      {children}
    </Surface>
  );
}
const columnWidths = {
  sm: "w-12",
  md: "w-28",
  lg: "w-48",
};
const columnVariants = {
  id: {
    container: "min-w-[30px] justify-start items-center",
    text: "text-center",
  },
  subtitled: {
    container: "flex-col justify-center items-start ",
    text: "",
  },
  actions: {
    container: "flex-row justify-center gap-4",
    text: "",
  },
};

type ColumnProps = {
  text?: string;
  width?: keyof typeof columnWidths;
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
  width,
  containerClass,
  textClass,
  children,
}: PropsWithChildren<ColumnProps>) {
  return (
    <View
      className={cn(
        "flex-row items-center",
        expand && !width && variant !== "id" && "flex-1",
        variant && columnVariants[variant].container,
        width && ["shrink-0", columnWidths[width]],
        width && variant === "actions" && "justify-end",
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
        <View className="max-w-full flex-row justify-start items-center">
          <Text variant="caption" className="shrink" numberOfLines={1}>
            {subtitle1}
          </Text>
          {subtitle1 && subtitle2 && <Icon icon={Dot} tone="faint" />}
          <Text variant="caption" className="shrink" numberOfLines={1}>
            {subtitle2}
          </Text>
        </View>
      )}
    </View>
  );
}
