import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn } from "../../theme";
import { Searchbar } from "../form/search/Searchbar";
import { Text } from "./Text";

type Props = {
  title: string;
  subtitle?: string;
  lead?: ReactNode;
  search?: {
    value: string;
    onChange: (t: string) => void;
    placeholder?: string;
  };
  /** Junto al buscador (otro campo de búsqueda, por ejemplo). */
  searchExtra?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  lead,
  search,
  searchExtra,
  children,
}: PropsWithChildren<Props>) {
  const { isExpanded } = useLayoutMode();

  const bar = (className?: string) =>
    search && (
      <Searchbar
        value={search.value}
        onChangeText={search.onChange}
        placeholder={search.placeholder}
        className={className}
      />
    );

  const searchbar = !search ? null : !searchExtra ? (
    bar(isExpanded ? undefined : "w-full h-10")
  ) : (
    <View
      className={cn(
        "flex-row items-center gap-3",
        isExpanded ? "w-full max-w-[520px]" : "h-10 w-full",
      )}
    >
      {bar("w-auto max-w-none flex-1")}
      {searchExtra}
    </View>
  );

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-4">
        <View>
          <Text variant="title">{title}</Text>
          {subtitle && <Text variant="caption">{subtitle}</Text>}
        </View>
        <View className="flex-1 flex-row items-center justify-end gap-4">
          {isExpanded && searchbar}
          {children}
        </View>
        {lead}
      </View>
      {!isExpanded && searchbar}
    </View>
  );
}
