import type { ReactElement, ReactNode } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Text } from "../base/Text";

type Props<T extends { id: number }> = {
  items: T[];
  loading: boolean;
  onEndReached: () => void;
  renderItem: (item: T) => ReactElement;
  toolbar?: ReactNode;
};

export function ItemList<T extends { id: number }>({
  items,
  loading,
  onEndReached,
  renderItem,
  toolbar,
}: Props<T>) {
  return (
    <View className="flex-1 gap-5 pt-2">
      {toolbar && (
        <View className="flex-row items-center justify-between px-1">
          {toolbar}
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => renderItem(item)}
        contentContainerStyle={{ gap: 12 }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator /> : undefined}
        ListEmptyComponent={
          loading ? undefined : (
            <Text variant="h3" className="text-secondary text-center pt-[10] ">
              Sin resultados
            </Text>
          )
        }
      />
    </View>
  );
}
