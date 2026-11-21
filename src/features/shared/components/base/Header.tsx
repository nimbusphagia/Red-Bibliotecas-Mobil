import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
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
};

export function PageHeader({
  title,
  subtitle,
  lead,
  search,
  children,
}: PropsWithChildren<Props>) {
  const { isExpanded } = useLayoutMode();

  const searchbar = search && (
    <Searchbar
      value={search.value}
      onChangeText={search.onChange}
      placeholder={search.placeholder}
      className={isExpanded ? undefined : "w-full h-10"}
    />
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
