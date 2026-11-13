import type { BookSort } from "@/features/catalog/internal/book/schemas";
import { Button, Text } from "@/features/shared/components";
import { cn, colors } from "@/features/shared/theme";
import type { SortDirection } from "@/features/shared/types/types";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

const OPTIONS: { key: BookSort; label: string; defaultDir: SortDirection }[] = [
  { key: "title", label: "Título", defaultDir: "asc" },
  { key: "createdAt", label: "Fecha de registro", defaultDir: "desc" },
  { key: "availableCount", label: "Disponibles", defaultDir: "desc" },
];

type Props = {
  sortBy: BookSort;
  sortDir: SortDirection;
  onChange: (sortBy: BookSort, sortDir: SortDirection) => void;
};

export default function SortMenu({ sortBy, sortDir, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const pick = (key: BookSort, defaultDir: SortDirection) => {
    if (key === sortBy) onChange(key, sortDir === "asc" ? "desc" : "asc");
    else onChange(key, defaultDir);
    setOpen(false);
  };

  const Arrow = sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <>
      <Button
        variant="pill-secondary"
        lucideIcon={<ArrowDownUp size={18} color={colors.highlight} />}
        onPress={() => setOpen(true)}
      />
      <Modal
        transparent
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/5"
          onPress={() => setOpen(false)}
        >
          <View className="w-64 rounded-[30] border border-foreground bg-background py-7 px-5 gap-5">
            <Text variant="h3" className="px-2">
              Ordenar por:
            </Text>
            {OPTIONS.map(({ key, label, defaultDir }) => {
              const selectedClass = key === sortBy ? "bg-foreground" : "";
              return (
                <Pressable
                  key={key}
                  onPress={() => pick(key, defaultDir)}
                  className={cn(
                    "flex-row items-center justify-between rounded-full px-5 py-3 bg-foreground/50",
                    selectedClass,
                  )}
                >
                  <Text variant="subtitle" className="font-bold text-highlight">
                    {label}
                  </Text>
                  {key === sortBy && (
                    <Arrow size={16} strokeWidth={3} color={colors.highlight} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
