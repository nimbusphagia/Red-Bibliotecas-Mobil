import { ChevronDown, ChevronUp } from "lucide-react-native";
import {
  Fragment,
  useEffect,
  useEffectEvent,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { colors, useTone } from "../../theme";
import { Icon } from "../base/Icon";
import { Surface } from "../base/Surface";

type Props<T extends { id: number }> = {
  header: ReactNode;
  /** Carga las filas al abrir. */
  load: () => Promise<T[]>;
  renderItem: (item: T) => ReactElement;
  /** Cambia cuando las filas abiertas deben volver a cargarse. */
  reloadKey?: unknown;
  /** Si cambia, abre o cierra el grupo. */
  defaultOpen?: boolean;
};

/** Grupo plegable: un encabezado y, al abrirlo, sus filas sobre un fondo inset. */
export function CollapsibleList<T extends { id: number }>({
  header,
  load,
  renderItem,
  reloadKey,
  defaultOpen = false,
}: Props<T>) {
  const t = useTone();
  const [open, setOpen] = useState(defaultOpen);
  const [items, setItems] = useState<T[]>();
  const loadItems = useEffectEvent(load);

  useEffect(() => setOpen(defaultOpen), [defaultOpen]);

  useEffect(() => {
    if (!open) return;
    let stale = false;
    setItems(undefined);
    loadItems().then((rows) => {
      if (!stale) setItems(rows);
    });
    return () => {
      stale = true;
    };
  }, [open, reloadKey]);

  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <Surface inset className="gap-3 rounded-2xl p-3">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-4 px-1 py-1"
      >
        <View className="flex-1">{header}</View>
        <View className="size-6 items-center justify-center rounded-full bg-bg/25">
          <Icon icon={Chevron} tone="darkSolid" />
        </View>
      </Pressable>
      {open && !items && <ActivityIndicator color={colors[t.icon]} />}
      {open &&
        items?.map((item) => (
          <Fragment key={item.id}>{renderItem(item)}</Fragment>
        ))}
    </Surface>
  );
}
