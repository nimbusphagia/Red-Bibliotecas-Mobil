import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../base/Text";

export type TableColumn<T> = {
  key: string;
  title: string;
  flex?: number;
  align?: "left" | "center" | "right";
  render?: (item: T) => ReactNode;
};

type Props<T> = {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowPress?: (item: T) => void;
};

const alignClass = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
} as const;

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
}: Props<T>) {
  return (
    <View className="border border-primary rounded-md overflow-hidden">
      <View className="flex flex-row items-center px-2 py-2 bg-highlight">
        {columns.map((col) => (
          <View
            key={col.key}
            className={alignClass[col.align ?? "left"]}
            style={{ flex: col.flex ?? 1 }}
          >
            <Text className="font-semibold text-white text-[16px]">
              {col.title}
            </Text>
          </View>
        ))}
      </View>

      {data.map((item) => (
        <Pressable
          key={keyExtractor(item)}
          onPress={() => onRowPress?.(item)}
          className="flex flex-row items-center px-2 py-2 border-b border-primary active:bg-fg1"
        >
          {columns.map((col) => {
            const content = col.render
              ? col.render(item)
              : String((item as Record<string, unknown>)[col.key] ?? "");

            return (
              <View
                key={col.key}
                className={alignClass[col.align ?? "left"]}
                style={{ flex: col.flex ?? 1 }}
              >
                {typeof content === "string" || typeof content === "number" ? (
                  <Text className="text-highlight">{content}</Text>
                ) : (
                  content
                )}
              </View>
            );
          })}
        </Pressable>
      ))}
    </View>
  );
}
