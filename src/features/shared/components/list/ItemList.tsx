import type { ReactElement, ReactNode } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { Surface } from "../base/Surface";
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
        <Surface
          tone="dark"
          className="flex-row items-center justify-between rounded-lg p-3"
        >
          {toolbar}
        </Surface>
      )}
      <Surface className="flex-1 overflow-hidden">
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
          columnWrapperStyle={multi ? { gap: 12 } : undefined}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator /> : undefined}
          ListEmptyComponent={
            loading ? undefined : (
              <Text variant="caption" className="pt-3 text-center">
                Sin resultados
              </Text>
            )
          }
        />
      </Surface>
    </View>
  );
}
