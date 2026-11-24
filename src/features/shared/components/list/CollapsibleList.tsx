import { ChevronDown } from "lucide-react-native";
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { colors, useTone } from "../../theme";
import { Icon } from "../base/Icon";
import { DURATION, FADE_IN, LAYOUT } from "../base/motion";
import { Surface } from "../base/Surface";

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

type GroupId = string | number;
type OpenGroup = [
  GroupId | undefined,
  Dispatch<SetStateAction<GroupId | undefined>>,
];

const OpenGroupContext = createContext<OpenGroup | null>(null);

/** Dentro de este proveedor, abrir un grupo cierra el que estaba abierto. */
export function AccordionProvider({ children }: { children: ReactNode }) {
  const state = useState<GroupId>();
  return (
    <OpenGroupContext.Provider value={state}>
      {children}
    </OpenGroupContext.Provider>
  );
}

type Props<T extends { id: number }> = {
  /** Identifica el grupo dentro de un AccordionProvider. */
  groupId?: GroupId;
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
  groupId,
  header,
  load,
  renderItem,
  reloadKey,
  defaultOpen = false,
}: Props<T>) {
  const t = useTone();
  const accordion = useContext(OpenGroupContext);
  const [openId, setOpenId] =
    accordion && groupId !== undefined ? accordion : [];
  const [open, setOpen] = useState(
    defaultOpen || (openId !== undefined && openId === groupId),
  );
  const [items, setItems] = useState<T[]>();
  const loadItems = useEffectEvent(load);

  useEffect(() => setOpen(defaultOpen), [defaultOpen]);

  // Con defaultOpen (p. ej. buscando) los grupos pueden quedar todos abiertos.
  useEffect(() => {
    if (!defaultOpen && openId !== undefined && openId !== groupId)
      setOpen(false);
  }, [openId, groupId, defaultOpen]);

  const toggle = () => {
    if (!open) setOpenId?.(groupId);
    else if (openId === groupId) setOpenId?.(undefined);
    setOpen(!open);
  };

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

  return (
    <AnimatedSurface
      inset
      layout={LAYOUT}
      className="gap-3 overflow-hidden rounded-2xl p-3"
    >
      <Pressable
        onPress={toggle}
        className="flex-row items-center gap-4 px-1 py-1"
      >
        <View className="flex-1">{header}</View>
        <Animated.View
          className="size-6 items-center justify-center rounded-full bg-bg/25"
          style={{
            transform: [{ rotate: open ? "180deg" : "0deg" }],
            transitionProperty: "transform",
            transitionDuration: DURATION,
          }}
        >
          <Icon icon={ChevronDown} tone="darkSolid" />
        </Animated.View>
      </Pressable>
      {open && !items && <ActivityIndicator color={colors[t.icon]} />}
      {open &&
        items?.map((item) => (
          <Animated.View key={item.id} entering={FADE_IN}>
            {renderItem(item)}
          </Animated.View>
        ))}
    </AnimatedSurface>
  );
}
