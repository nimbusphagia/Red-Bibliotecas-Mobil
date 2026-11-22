import { X } from "lucide-react-native";
import { useContext, useEffect, useId, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import { useDebounce } from "../../../hooks/useDebounce";
import { cn, colors, useTone } from "../../../theme";
import { Text } from "../../base/Text";
import type { Option } from "./option";
import { Icon } from "../../base/Icon";
import { DialogDismissContext } from "../../base/dismiss";
import { FADE_IN, FADE_OUT, LAYOUT } from "../../base/motion";

export type SearchSelectProps = {
  label?: string;
  value?: Option;
  onChange: (option?: Option) => void;
  fetchOptions: (search: string) => Promise<Option[]>;
  placeholder?: string;
  onCreate?: (name: string) => void;
  initiallyOpen?: boolean;
};

export function SearchSelect({
  label,
  value,
  onChange,
  fetchOptions,
  placeholder = "Todos",
  onCreate,
  initiallyOpen,
}: SearchSelectProps) {
  const [open, setOpen] = useState(!!initiallyOpen);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [none, setNone] = useState(false);
  const debounced = useDebounce(search);
  const t = useTone();

  useEffect(() => {
    let stale = false;
    fetchOptions(debounced).then((o) => {
      if (stale) return;
      setOptions(o);
      if (debounced === "") setNone(o.length === 0);
    });
    return () => {
      stale = true;
    };
  }, [debounced, fetchOptions]);

  const empty = none && !value && !onCreate;
  const isOpen = open && !empty;

  const typed = debounced.trim().toLowerCase();
  const canCreate =
    !!onCreate &&
    typed !== "" &&
    !options.some((o) => o.label.toLowerCase() === typed);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  // Toque fuera del select (pero dentro del Dialog): cierra solo el select.
  const id = useId();
  const { tick, except, protect } = useContext(DialogDismissContext);
  const lastTick = useRef(tick);
  useEffect(() => {
    if (tick === lastTick.current) return;
    lastTick.current = tick;
    if (except !== id) close();
  }, [tick]);
  const pick = (option?: Option) => {
    onChange(option);
    close();
  };
  const create = () => {
    onCreate?.(search.trim());
    close();
  };

  return (
    <Animated.View
      layout={LAYOUT}
      className="gap-2"
      onStartShouldSetResponderCapture={() => {
        protect(id);
        return false;
      }}
    >
      {label && (
        <Text variant="item">{label}</Text>
      )}

      {empty ? (
        <View className={cn("h-12 justify-center rounded-lg px-4", t.inset)}>
          <Text variant="caption">Sin resultados</Text>
        </View>
      ) : isOpen ? (
        <View className={cn("h-12 flex-row items-center gap-2 rounded-lg px-4", t.inset)}>
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder={value?.label ?? "Buscar..."}
            placeholderTextColor={colors[t.placeholder]}
            className={cn("h-full flex-1 font-sans", t.text)}
          />
          <Pressable onPress={close} hitSlop={8}>
            <Icon icon={X} size="md" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          className={cn(
            "h-12 justify-center rounded-lg px-4 active:opacity-80",
            value ? t.accent.box : t.inset,
          )}
        >
          <Text variant="itemSm" className={cn(value && t.accent.label)}>
            {value?.label ?? placeholder}
          </Text>
        </Pressable>
      )}

      {isOpen && (
        <Animated.View
          entering={FADE_IN}
          exiting={FADE_OUT}
          className={cn("max-h-60 overflow-hidden rounded-lg", t.inset)}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {value && (
              <Pressable onPress={() => pick(undefined)} className="px-4 py-3 active:opacity-80">
                <Text variant="item">
                  Quitar filtro
                </Text>
              </Pressable>
            )}
            {canCreate && (
              <Pressable onPress={create} className="px-4 py-3 active:opacity-80">
                <Text variant="item" className="font-sans-semibold">
                  Crear «{search.trim()}»
                </Text>
              </Pressable>
            )}
            {options.length === 0 && (
              <Text variant="caption" className="px-4 py-3 text-center">
                Sin resultados
              </Text>
            )}
            {options.map((o) => {
              return (
                <Pressable
                  key={o.id}
                  onPress={() => pick(o)}
                  className="px-4 py-3 active:opacity-80"
                >
                  <Text variant="itemSm">{o.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}
    </Animated.View>
  );
}
