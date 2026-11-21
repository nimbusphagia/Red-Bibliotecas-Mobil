import type { ReactElement, ReactNode } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { Text } from "../base/Text";

type Props<T extends { id: number }> = {
  items: T[];
  loading: boolean;
  onEndReached: () => void;
  renderItem: (item: T) => ReactElement;
  toolbar?: ReactNode;
  columns?: number;
};

export function ItemList<T extends { id: number }>({
  items,
  loading,
  onEndReached,
  renderItem,
  toolbar,
  columns = 1,
}: Props<T>) {
  const { isExpanded } = useLayoutMode();
  const numColumns = isExpanded ? columns : 1;
  const multi = numColumns > 1;

  return (
    <View className="flex-1 gap-4">
      {toolbar && (
        <View className="flex-row items-center justify-between bg-dark1 rounded-lg py-3 px-3">
          {toolbar}
        </View>
      )}
      <FlatList
        key={numColumns}
        numColumns={numColumns}
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) =>
          multi ? (
            <View
              style={{
                flex: 1,
                maxWidth: `${100 / numColumns}%` as `${number}%`,
              }}
            >
              {renderItem(item)}
            </View>
          ) : (
            renderItem(item)
          )
        }
        className="rounded-2xl"
        contentContainerClassName="gap-3 p-2 bg-white"
        columnWrapperStyle={multi ? { gap: 12 } : undefined}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator /> : undefined}
        ListEmptyComponent={
          loading ? undefined : (
            <Text variant="item" className="text-secondary text-center pt-3">
              Sin resultados
            </Text>
          )
        }
      />
    </View>
  );
}
