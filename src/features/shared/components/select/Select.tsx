import { Text } from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { cn, colors } from "@/features/shared/theme";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

export type Option = { id: number; label: string };

type SimpleProps = {
  label: string;
  options: Option[];
  value?: number;
  onChange: (id?: number) => void;
  disabled?: boolean;
};

export function SimpleSelect({
  label,
  options,
  value,
  onChange,
  disabled,
}: SimpleProps) {
  return (
    <View className={cn("gap-3", disabled && "opacity-50")}>
      <Text variant="h3">{label}</Text>
      <View className="flex-row flex-wrap gap-x-3 gap-y-4">
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <Pressable
              key={o.id}
              disabled={disabled}
              onPress={() => onChange(selected ? undefined : o.id)}
              className={cn(
                "rounded-full px-4 py-1.5",
                selected ? "bg-primary" : "bg-fg1",
              )}
            >
              <Text
                className={cn(
                  "font-semibold",
                  selected ? "text-bg" : "text-secondary",
                )}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type SearchProps = {
  label?: string;
  value?: Option;
  onChange: (option?: Option) => void;
  fetchOptions: (search: string) => Promise<Option[]>;
  placeholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  onCreate?: (name: string) => void;
  initiallyOpen?: boolean;
};

export function SearchSelect({
  label,
  value,
  onChange,
  fetchOptions,
  placeholder = "Todos",
  clearLabel = "Quitar filtro",
  disabled,
  onCreate,
  initiallyOpen,
}: SearchProps) {
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
      {label && <Text variant="h3">{label}</Text>}

      {empty ? (
        <View className="h-12 justify-center rounded-full bg-fg1 px-4">
          <Text variant="subtitle">Sin resultados</Text>
        </View>
      ) : isOpen ? (
        <View className="h-12 flex-row items-center gap-2 rounded-full bg-fg1 px-4">
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder={value?.label ?? "Buscar..."}
            placeholderTextColor={colors.primary}
            className="h-full flex-1 font-sans text-highlight"
          />
          <Pressable onPress={close} hitSlop={8}>
            <X size={18} color={colors.primary} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          disabled={disabled}
          onPress={() => setOpen(true)}
          className={cn(
            "h-12 justify-center rounded-full bg-fg1 px-4",
            disabled && "opacity-50",
          )}
        >
          <Text variant="subtitle">{value?.label ?? placeholder}</Text>
        </Pressable>
      )}

      {isOpen && (
        <View className="max-h-[240] overflow-hidden rounded-[30] bg-fg2">
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {value && (
              <Pressable
                onPress={() => pick(undefined)}
                className="border-b border-fg1 px-4 py-2"
              >
                <Text variant="subtitle">{clearLabel}</Text>
              </Pressable>
            )}
            {canCreate && (
              <Pressable
                onPress={create}
                className="border-b border-fg1 px-4 py-2"
              >
                <Text
                  variant="subtitle"
                  className="font-semibold text-highlight"
                >
                  Crear «{search.trim()}»
                </Text>
              </Pressable>
            )}
            {options.length === 0 && (
              <Text variant="subtitle" className="px-4 py-3">
                Sin resultados
              </Text>
            )}
            {options.map((o, i) => {
              const separatorClass =
                i !== options.length - 1 ? "border-b border-fg1" : "";
              return (
                <Pressable
                  key={o.id}
                  onPress={() => pick(o)}
                  className={cn("px-4 py-2", separatorClass)}
                >
                  <Text variant="subtitle" className="font-semibold">
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

type MultiProps = Omit<SearchProps, "value" | "onChange" | "clearLabel"> & {
  values: Option[];
  onChange: (options: Option[]) => void;
};

export function MultiSearchSelect({
  label,
  values,
  onChange,
  disabled,
  ...search
}: MultiProps) {
  const add = (option?: Option) => {
    if (option && !values.some((v) => v.id === option.id)) {
      onChange([...values, option]);
    }
  };

  return (
    <View className="gap-2">
      {label && <Text variant="h3">{label}</Text>}
      {!disabled && <SearchSelect {...search} onChange={add} />}
      {values.length > 0 && (
        <View className="flex-row flex-wrap justify-center gap-3 pt-3">
          {values.map((o) => (
            <Pressable
              key={o.id}
              disabled={disabled}
              onPress={() => onChange(values.filter((v) => v.id !== o.id))}
              className="flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-1.5"
            >
              <Text className="font-semibold text-bg">{o.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
