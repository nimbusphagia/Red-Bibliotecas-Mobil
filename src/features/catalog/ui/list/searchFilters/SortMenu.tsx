import type { BookSort } from "@/features/catalog/internal/book/schemas";
import { Button, Dialog, Text } from "@/features/shared/components";
import { cn, colors } from "@/features/shared/theme";
import type { SortDirection } from "@/features/shared/types/types";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";

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
        variant="secondary"
        icon={<ArrowDownUp size={18} color={colors.highlight} />}
        onPress={() => setOpen(true)}
      />
      {open && (
        <Dialog
          onClose={() => setOpen(false)}
          className="w-64 gap-5 rounded-[30px] px-5 py-7"
        >
          <Text variant="h3" className="px-2">
            Ordenar por:
          </Text>
          {OPTIONS.map(({ key, label, defaultDir }) => {
            const selectedClass = key === sortBy ? "bg-fg1" : "";
            return (
              <Pressable
                key={key}
                onPress={() => pick(key, defaultDir)}
                className={cn(
                  "flex-row items-center justify-between rounded-full px-5 py-3 bg-fg2",
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
        </Dialog>
      )}
    </>
  );
}
