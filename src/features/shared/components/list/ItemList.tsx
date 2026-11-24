import type { ReactElement, ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated from "react-native-reanimated";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn, colors, useTone, type Tone } from "../../theme";
import { LAYOUT } from "../base/motion";
import { Surface } from "../base/Surface";
import { Text } from "../base/Text";
import { AccordionProvider } from "./CollapsibleList";

type Props<T extends { id: number }> = {
  items: T[];
  loading: boolean;
  onEndReached?: () => void;
  renderItem: (item: T) => ReactElement;
  toolbar?: ReactNode;
  /**
   * Dibujar el toolbar sobre su propia superficie (por defecto sí).
   * Con `false` queda sin fondo ni padding, sobre lo que haya detrás, y sus
   * botones toman el tono de ese fondo, no el de `tone`.
   */
  toolbarSurface?: boolean;
  /**
   * Tono de la lista y de su toolbar (cuando tiene superficie). Todo lo de
   * adentro (filas, texto, botones, íconos) lo toma por contexto.
   * Sin `tone`: la lista hereda el del padre (sobre canvas, Surface la pasa
   * a `light`) y el toolbar es `dark`.
   */
  tone?: Tone;
  columns?: number;
  compactColumns?: number;
  /** Separación entre filas. Solo los pickers de los diálogos la usan. */
  gap?: boolean;
};

const COLUMN_GAP = 12;

function Loader() {
  const t = useTone();
  return <ActivityIndicator color={colors[t.icon]} />;
}

export function ItemList<T extends { id: number }>({
  items,
  loading,
  onEndReached,
  renderItem,
  toolbar,
  toolbarSurface = true,
  tone,
  columns = 1,
  compactColumns = 1,
  gap = true,
}: Props<T>) {
  const { isExpanded } = useLayoutMode();
  const numColumns = isExpanded ? columns : compactColumns;
  const multi = numColumns > 1;
  const toolbarRow = "flex-row items-center justify-between";

  return (
    <AccordionProvider>
      <View className="flex-1 gap-3">
        {toolbar &&
          (toolbarSurface ? (
            <Surface
              tone={tone ?? "dark"}
              className={cn(toolbarRow, "rounded-lg p-3")}
            >
              {toolbar}
            </Surface>
          ) : (
            <View className={cn(toolbarRow, "px-1")}>{toolbar}</View>
          ))}
        <Surface tone={tone} className="flex-1 overflow-hidden">
          <Animated.FlatList
            key={numColumns}
            numColumns={numColumns}
            data={items}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) =>
              multi ? (
                <View
                  style={{
                    width: `${100 / numColumns}%`,
                    paddingHorizontal: COLUMN_GAP / 2,
                  }}
                >
                  {renderItem(item)}
                </View>
              ) : (
                renderItem(item)
              )
            }
            contentContainerClassName={cn("p-3", gap && "gap-3")}
            itemLayoutAnimation={multi ? undefined : LAYOUT}
            columnWrapperStyle={
              multi ? { marginHorizontal: -COLUMN_GAP / 2 } : undefined
            }
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <Loader /> : undefined}
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
    </AccordionProvider>
  );
}
