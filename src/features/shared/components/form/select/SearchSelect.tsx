import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useDebounce } from "../../../hooks/useDebounce";
import { cn, colors } from "../../../theme";
import { Text } from "../../base/Text";
import type { Option } from "./option";
import { Icon } from "../../base/Icon";

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
  const pick = (option?: Option) => {
    onChange(option);
    close();
  };
  const create = () => {
    onCreate?.(search.trim());
    close();
  };

  return (
    <View className="gap-2">
      {label && <Text variant="item">{label}</Text>}

      {empty ? (
        <View className="h-12 justify-center rounded-xl bg-fg1 px-4">
          <Text variant="caption">Sin resultados</Text>
        </View>
      ) : isOpen ? (
        <View className="h-12 flex-row items-center gap-2 rounded-xl bg-bg px-4">
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder={value?.label ?? "Buscar..."}
            placeholderTextColor={colors.dark1}
            className="h-full flex-1 font-sans text-dark2"
          />
          <Pressable onPress={close} hitSlop={8}>
            <Icon icon={X} size="md" tone="dark2" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          className={cn("h-12 justify-center rounded-lg bg-bg px-4")}
        >
          <Text variant="itemSm">{value?.label ?? placeholder}</Text>
        </Pressable>
      )}

      {isOpen && (
        <View className="max-h-60 overflow-hidden rounded-xl bg-bg">
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {value && (
              <Pressable
                onPress={() => pick(undefined)}
                className="border-b border-white px-4 py-3"
              >
                <Text variant="item">Quitar filtro</Text>
              </Pressable>
            )}
            {canCreate && (
              <Pressable
                onPress={create}
                className="border-b border-fg1 px-4 py-3"
              >
                <Text
                  variant="item"
                  className="font-sans-semibold text-highlight"
                >
                  Crear «{search.trim()}»
                </Text>
              </Pressable>
            )}
            {options.length === 0 && (
              <Text variant="caption" className="px-4 py-3 text-center">
                Sin resultados
              </Text>
            )}
            {options.map((o, i) => {
              const separatorClass =
                i !== options.length - 1 ? "border-b border-white" : "";
              return (
                <Pressable
                  key={o.id}
                  onPress={() => pick(o)}
                  className={cn("px-4 py-3", separatorClass)}
                >
                  <Text variant="itemSm">{o.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
